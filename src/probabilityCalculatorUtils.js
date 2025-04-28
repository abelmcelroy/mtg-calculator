const bigNum = require("bignumber.js")

function binKeySort (arr) {
  return arr.sort((a, b) => a === "O" ? 1 : b === "O" ? -1 : a.length > b.length ? -1 : a.length < b.length ? 1 : 0);
}

function convertedManaCost(card) {
  return Object.values(cardCostJSON(card)).reduce(sum, 0)
}

// returns all the bin structures necessary for the algorithm
/*
  deckBins: structure of deck,
  costBins: structure of mana required cards,
  tapBins: overlay on deckBins which describes distribution of tap lands,
  relevantBinsMap: describes edges from costBins to deckBins,
  relevantBinsReverseMap: describes edges from deckBins to costBins
*/
function preprocessInput(deck, targetCard, totalDraws) {
  if (!Array.isArray(deck)) deck = Object.values(deck) // in case we're passed a dict

  const deckInfo = {
    targetCardCount: 0,
    landCount: 0
  }
  const costBins = cardCostJSON(targetCard)
  // augment card cost to include...
  // Target card
  costBins.T = 1
  const CMC = convertedManaCost(targetCard)
  // Other cards
  if (CMC < totalDraws) costBins.O = totalDraws - CMC - 1


  const deckBins = {}
  const tapBins = {}
  // making deck bins which are dependant on the cost of the card
  deck.forEach(card => {
    const isTargetCard = card.name === targetCard.name
    const producesMana = card.producible_mana_colors && card.producible_mana_colors !== "F"

    // if the card is the target card add it to the T,O bin
    if (isTargetCard) {
      deckBins["T,O"] = deckBins["T,O"] ? deckBins["T,O"] + card.quantity : card.quantity;
      deckInfo.targetCardCount += card.quantity;
    }
    // if the card produces mana see what kinds (if any) help pay the mana cost, add to that bin or create it
    else if (producesMana) {
      deckInfo.landCount += card.quantity
      const usefulTypes = []

      card.producible_mana_colors.split(",").forEach(producibleColor => {
        for (let necessaryColor in costBins) {
          // for each color the land produces, if that land could pay for any of the types of the cost bins, hand onto it
          const producesThisColor = (necessaryColor === "C" || necessaryColor.includes(producibleColor)) && !usefulTypes.includes(necessaryColor)
          if (producesThisColor) usefulTypes.push(necessaryColor)
        }
      })
      if (usefulTypes.length) {
        usefulTypes.sort()
        if (costBins.O) usefulTypes.push("O") // even if a card is useful, other cards can still go into that bin
        const deckBinKey = usefulTypes.join(",")
        deckBins[deckBinKey] = deckBins[deckBinKey] ? deckBins[deckBinKey] + card.quantity : card.quantity
        if (card.tap_land) tapBins[deckBinKey] = tapBins[deckBinKey] ? tapBins[deckBinKey] + card.quantity : card.quantity
        // sometimes a card that produces mana still isn't helpfuil... thats what the "O"ther bin is for
      } else deckBins.O = deckBins.O ? deckBins.O + card.quantity : card.quantity
    }
    // if the augmented cost includes additional "O"ther cards, place useless cards there
    else if (costBins.O) deckBins.O = deckBins.O ? deckBins.O + card.quantity : card.quantity
  })

  // making relevant bin map which expresses edges from cost bins to deck bins
  const relevantBinsMap = Object.keys(costBins).reduce((relBinDict, costKey) => {
    relBinDict[costKey] = []
    return relBinDict
  }, {})
  // making relevant bin map which expresses edges from deck bins to cost bins
  const relevantBinsReverseMap = Object.keys(deckBins).reduce((relBinDict, deckBinKey) => {
    relBinDict[deckBinKey] = []
    return relBinDict
  }, {})
  // populating two above maps
  binKeySort(Object.keys(deckBins)).forEach((deckBinKey, i) => {
    let costTypes = deckBinKey.split(",")
    binKeySort(Object.keys(costBins)).forEach((costKey, j) => {
      if (costTypes.includes(costKey)) {
        relevantBinsMap[costKey].push(i)
        relevantBinsReverseMap[deckBinKey].push(j)
      }
    })
  })

  return { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo }
}

// conversion of the big number objects and counts into probabilities
function postProcess(resultsArr, deckBins, startingHandSize, totalDraws, deckInfo, CMC, nCkCache) {

  // data structure for each turn
  const probabilitiesDict = {
    independent: "0",
    conditionalTargetDrawn: "0",
    conditionalEnoughLand: "0"
  }

  const deckSize = Object.values(deckBins).reduce(sum, 0)

  const probabilities = resultsArr.map((bigNumber, i) => {
    const probabilitiesDictCopy = { ...probabilitiesDict }
    const handOrders = factorial(i + startingHandSize)
    const numberOfAllHands = nCk(deckSize, i + startingHandSize).times(handOrders)

    // counting ways to get at least one of the target card in your hand by turn i
    let numberOfHandsContainingCard = new bigNum(0)
    for (let m = Math.max(1, startingHandSize + i - (deckSize - deckBins["T,O"])); m <= Math.min(deckBins["T,O"], startingHandSize + i); m++) {
      numberOfHandsContainingCard = numberOfHandsContainingCard.plus(
        nCk(deckSize - deckBins["T,O"], startingHandSize + i - m, nCkCache).times(nCk(deckBins["T,O"], m, nCkCache))
      )
    }
    numberOfHandsContainingCard = numberOfHandsContainingCard.times(handOrders)

    // counting ways to get at least as many lands as the card's converted mana cost
    let numberOfHandsContainingEnoughLands = new bigNum(0)
    for (let m = Math.max(CMC, startingHandSize + i - (deckSize - deckInfo.landCount)); m <= Math.min(startingHandSize + i, deckInfo.landCount); m++) {
      numberOfHandsContainingEnoughLands = numberOfHandsContainingEnoughLands.plus(
        nCk(deckSize - deckInfo.landCount, startingHandSize + i - m, nCkCache).times(nCk(deckInfo.landCount, m, nCkCache))
      )
    }
    numberOfHandsContainingEnoughLands = numberOfHandsContainingEnoughLands.times(handOrders)

    // probability of being able to play the card on turn i
    probabilitiesDictCopy.independent = bigNumber.dividedBy(numberOfAllHands).toString()
    // probability of being able to play card given we draw at least one copy of it
    probabilitiesDictCopy.conditionalTargetDrawn = numberOfHandsContainingEnoughLands.eq(0) ? "0" : bigNumber.dividedBy(numberOfHandsContainingCard).toString()
    // probability of being able to play card given we draw at least the number of lands that the card's converted mana cost is
    probabilitiesDictCopy.conditionalEnoughLand = numberOfHandsContainingEnoughLands.eq(0) ? "0" : bigNumber.dividedBy(numberOfHandsContainingEnoughLands).toString()

    return probabilitiesDictCopy
  })

  while(probabilities.length < (totalDraws - 6)) probabilities.push(probabilitiesDict)
  return probabilities
}

function cardCostJSON(card) {
  const costJSON = {}
  card.mana_cost.replace(/[\{\}X]+?/g, " ").trim().split(/\s+/g).forEach(requiredManaType => {
    const quantity = isNaN(parseInt(requiredManaType)) ? 1 : parseInt(requiredManaType)
    requiredManaType = isNaN(parseInt(requiredManaType)) ? requiredManaType : "C"
    costJSON[requiredManaType] = costJSON[requiredManaType] ? costJSON[requiredManaType] + quantity : quantity
  })
  Object.keys(costJSON).forEach(requiredManaType => {
    if (costJSON[requiredManaType] === 0) delete costJSON[requiredManaType]
  })
  return costJSON
}

// heuristic for estimating how complex a calculation will be, and if it should be skipped
function complexity(relevantBinsMap, costBins) {
  let measure = new bigNum(1)
  Object.keys(costBins).forEach(costBinKey => {
    measure = measure.times(nCk(costBins[costBinKey] + relevantBinsMap[costBinKey].length - 1, relevantBinsMap[costBinKey].length - 1))
  })
  return measure
}

function sum(a, b) {
  return a + b
}

// takes two numbers returns one BigNum, optional cache
function nCk(n, k, cache = null) {

  if (k === 0) return new bigNum(1);
  if (bigNum(k).isGreaterThan(n)) return new bigNum(0);
  if (cache && cache[`${n},${k}`]) return cache[`${n},${k}`];

  let result = new bigNum(1);
  let d = new bigNum(1);
  for (var i = n; i > Math.max(n - k, k); i--) {
    result = result.times(i).dividedBy(d)
    d = d.plus(1);
  }

  if (cache) cache[`${n},${k}`] = result;
  return result;
}

// takes a number and returns a BigNum
function factorial(n) {
  let Fn = new bigNum(1)
  while (n > 1) {
    Fn = Fn.times(n)
    n--
  }
  return Fn
}

module.exports = {
  sum,
  nCk,
  factorial,
  convertedManaCost,
  preprocessInput,
  postProcess,
  complexity,
  binKeySort,
}