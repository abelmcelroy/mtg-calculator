
// the following two functions are from https://www.delftstack.com/howto/javascript/javascript-random-seed-to-generate-random/
// the algorithms they're using (which they are named by) are far more ubiquitous
function MurmurHash3(string) {
  let i = 0;
  for (i, hash = 1779033703 ^ string.length; i < string.length; i++) {
      let bitwise_xor_from_character = hash ^ string.charCodeAt(i);
      hash = Math.imul(bitwise_xor_from_character, 3432918353);
      hash = hash << 13 | hash >>> 19;
  } return () => {
     // Return the hash that you can use as a seed
      hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
      hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
      return (hash ^= hash >>> 16) >>> 0;
  }
}

function SimpleFastCounter32(seed_1, seed_2, seed_3, seed_4) {
  return () => {
    seed_1 >>>= 0; seed_2 >>>= 0; seed_3 >>>= 0; seed_4 >>>= 0;
    let cast32 = (seed_1 + seed_2) | 0;
    seed_1 = seed_2 ^ seed_2 >>> 9;
    seed_2 = seed_3 + (seed_3 << 3) | 0;
    seed_3 = (seed_3 << 21 | seed_3 >>> 11);
    seed_4 = seed_4 + 1 | 0;
    cast32 = cast32 + seed_4 | 0;
    seed_3 = seed_3 + cast32 | 0;
    return (cast32 >>> 0) / 4294967296;
  }
}

const RANDOM_SEED = "OMG ur so random!! 😜";
const seeder = MurmurHash3(RANDOM_SEED);
const rand = SimpleFastCounter32(seeder(), seeder(), seeder(), seeder())

// making a synthetic deck from our bins
function synthesizeDeck(deckBins, tapBins, costBins, deckInfo) {
  let uselessLands = deckInfo.landCount - Object.keys(deckBins)
    .reduce((sum, typeKey) => sum + (/^(O)|(T\,O)$/.test(typeKey) ? 0 : deckBins[typeKey]), 0);
  const deck = []

  const cardCost = { ...costBins }
  delete cardCost.O
  delete cardCost.T

  let targetCard = null

  Object.keys(deckBins).forEach(deckBinKey => {
    for (let i = 0; i < deckBins[deckBinKey]; i++) {
      const card = {}
      if (i < tapBins[deckBinKey]) {
        card.isTapLand = true
      } if (deckBinKey !== "O" && deckBinKey !== "T,O") {
        card.producibleManaColors = new Set(deckBinKey.split(",").filter(type => !["O", "T"].includes(type)))
        card.isLand = true
      } else if (deckBinKey === "T,O") {
        card.isLand = false
        card.name = "targetCard"
        card.manaCost = cardCost
        card.CMC = Object.values(card.manaCost).reduce(sum, 0)
        targetCard = card
      } else if (uselessLands > 0) {
        card.producibleManaColors = new Set([]);
        card.isLand = true;
        uselessLands--;
      } else {
        card.isLand = false
        card.name = null
      }
      deck.push(card)
    }
  })

  return { deck, targetCard }
}

// simulates drawing cards "iterations" number of times and records -for each non land card in the deck- how many times it was playable on each turn up to turn "turns"
function simulateDraws(deckBins, tapBins, costBins, deckInfo, turns, iterations, startingHandSize = 7) {
  let cardCurve = new Array(turns).fill(0).map(_ => ({
    played: 0,
    targetDrawn: 0,
    enoughLands: 0
  }))
  const enumerationCache = {}
  const { deck, targetCard } = synthesizeDeck(deckBins, tapBins, costBins, deckInfo)
  
  for (let i = 0; i < iterations && targetCard; i++) {

    // preparing for next iteration
    let deckCopy = deck.slice()
    let landList = []
    let tapLandList = []
    let uselessLandsDrawn = 0;
    let lastCardDrawnIsTapland = false;
    let haveTargetCard = false
    let targetCardPlayedCurve = new Array(turns).fill(0).map(_ => ({
      played: false,
      targetDrawn: false,
      enoughLands: false
    }))
  
    // "draws" a card and puts it tallies/saves it for computation later
    function placeCard(card) {
      lastCardDrawnIsTapland = !!card.isTapLand;
      if (card.isLand) {
        if (card.producibleManaColors.size === 0) uselessLandsDrawn++;
        else if (card.isTapLand) tapLandList.push(card);
        else landList.push(card);
      } else if (card.name === "targetCard") {
        haveTargetCard = true;
      }
    }
  
    // preparing deck
    fisherYates(deckCopy)
    for (let j = 0; j < startingHandSize; j++) {
      let nextCard = deckCopy.pop()
      placeCard(nextCard)
    }

    // for each turn
    for (let turn = 0; turn < Math.min(turns, deck.length - 6); turn++) {
      
      // count all the drawn lands so we can compute conditional stats later
      if (uselessLandsDrawn + landList.length + tapLandList.length >= targetCard.CMC) targetCardPlayedCurve[turn].enoughLands = true

      // check if each nonland card drawn thus far is playable, if it was playable last turn it still is
      if (haveTargetCard) {

        // if the last card drawn was a tapland and it without it there aren"t enough lands, the card is not playable
        if (lastCardDrawnIsTapland && tapLandList.length + landList.length === targetCard.CMC) targetCardPlayedCurve[turn].played = false
        
        // if card was playable last turn, it still is
        else if (turn > 0 && targetCardPlayedCurve[turn - 1].played) targetCardPlayedCurve[turn].played = true
        
        // else find out if it's playable by simulating paying the mana cost
        else if (isPlayable(targetCard, landList, turn + 1, enumerationCache)) targetCardPlayedCurve[turn].played = true
        
        targetCardPlayedCurve[turn].targetDrawn = true
      }
  
      // if this was our last turn, just stop
      if (turn === turns) break;
  
      // otherwise push the taplands drawn this turn into the list with the other land cards and darw/place our next card in anticipation of next turn
      if (tapLandList.length) landList = landList.concat(...tapLandList)
      tapLandList = []
      let nextCard = deckCopy.pop()
      if (!nextCard) break
      placeCard(nextCard)
    }
  
    // now that all our cards for this iteration have been registered as playable or not, lets add some 1's to our counts
    cardCurve = cardCurve.map((countDict, i) => {
      Object.keys(countDict).forEach(countKey => {
        countDict[countKey] = targetCardPlayedCurve[i][countKey] ? countDict[countKey] + 1 : countDict[countKey]
      })
      return countDict
    })
  }

  // return our results
  return postProcessResults(cardCurve, iterations)
}

// making our results into stats
function postProcessResults(cardCurve, iterations) {
  return cardCurve.map(countDict => ({
    independent: (iterations ? countDict.played / iterations : 0).toString(),
    conditionalTargetDrawn: (countDict.targetDrawn ? countDict.played / countDict.targetDrawn : 0).toString(),
    conditionalEnoughLand: (countDict.enoughLands ? countDict.played / countDict.enoughLands : 0).toString()
  }))
}

// returns bool of if the card is playable given the state of the available lands and the turn
function isPlayable(card, landList, turn, enumerationCache = null) {
  const enoughTurns = turn >= card.CMC;
  const enoughLands = landList.length >= card.CMC;
  if (!enoughTurns || !enoughLands) return false;
  
  const landCombinations = nCkBitMasks(landList.length, turn, enumerationCache);

  for (let i = 0; i < landCombinations.length; i++) {

    const landCombo = landList.filter((_, j) => ((1 << j) & landCombinations[i]) > 0);
    // this line of logic takes care of taplands
    const everyLandInSelectionIsTapland = landCombo.every(land => land.isTapLand);
    if (landCombo.length === card.CMC && turn === card.CMC && everyLandInSelectionIsTapland) continue;

    const costCopy = copyShallow(card.manaCost);
    const availableMana = availableUsefulMana(costCopy, landCombo);
    payMana(costCopy, availableMana);

    if (Object.keys(costCopy).every(key => costCopy[key] <= 0)) return true;

  }

  return false;
}

// alg for paying mana intelligently based on a cards cost and the possible mana available
function payMana(cost, manaBase) {
  let scarcities = {}
  Object.keys(cost).forEach(color => {
    scarcities[color] = 0
    Object.keys(manaBase).forEach(type => {
      if (type.split(",").includes(color)) scarcities[color]++
    })
  })
  let sortedKeys = Object.keys(scarcities).sort((a, b) => scarcities[a] - scarcities[b])
  sortedKeys.forEach(color => {
    Object.keys(manaBase).forEach(type => {
      if (type.split(",").includes(color)) {
        let min = Math.min(manaBase[type], cost[color])
        cost[color] -= min
        manaBase[type] -= min
      }
    })
  })
  if (cost.C) {
    Object.keys(manaBase).forEach(type => {
      if (type !== "F" && cost.C) {
        let min = Math.min(manaBase[type], cost.C)
        cost.C -= min
        manaBase[type] -= min
      }
    })
  }
}

function nCkBitMasks(n, k, cache = null) {
  let results = []

  if (n < k) return [(1 << n) - 1]
  if (cache && cache[`${n},${k}`]) return cache[`${n},${k}`]
  function generate(kRemaining = k, order = 0, b = 0) {
    if (order > n && kRemaining === 0) results.push(b)
    else if (kRemaining <= n - order && kRemaining >= 0) {
      generate(kRemaining - 1, order + 1, b | Math.pow(2, order))
      generate(kRemaining, order + 1, b)
    }
  }
  generate()
  if (cache) cache[`${n},${k}`] = results
  return results
}


// finds useful available mana from landlist
function availableUsefulMana(cardCost, landList) {

  const availableMana = {}
  // making deck bins which are dependant on the cost of the card
  for (let i = 0; i < landList.length; i++) {
    let land = landList[i]
    // all possible types the land can produce
    let usefulProducibleColors = new Set()
    let producibleColors = land.producibleManaColors

    producibleColors.forEach(producibleColor => {
      for (necessaryColor in cardCost) {
        // for each color the land produces, if that land could pay for any of the types of the cost bins, hand onto it
        const producesThisColor = (necessaryColor === "C" || necessaryColor.includes(producibleColor))
        if (producesThisColor) usefulProducibleColors.add(necessaryColor)
      }
    })

    usefulProducibleColors.forEach(color => {
      availableMana[color] = availableMana[color] ? availableMana[color] + 1 : 1
    })
  }

  return availableMana
}

// shuffling in place
function fisherYates(array) {
  for (let i = array.length-1; i >= 0; i--) {
    const r = Math.floor(rand() * (i + 1));
    array.push(array.splice(r, 1)[0]);
  }
}

// reduce callback
function sum(a, b) {
  return  a + b
}

// for copying one-layer-deep arrays or json
function copyShallow(variable) {
  let variableCopy;
  if (Array.isArray(variable)) variableCopy = []
  else variableCopy = {}
  for (let key in variable) {
    variableCopy[key] = variable[key]
  }
  return variableCopy
}

module.exports = {
  fisherYates,
  simulateDraws,
  rand,
  MurmurHash3
}
