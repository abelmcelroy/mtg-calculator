const bigNum = require("bignumber.js")
const { postProcess, nCk, factorial, binKeySort } = require("./probabilityCalculatorUtils")

// for copying one-layer-deep arrays or json
function copyShallow(variable) {
  const variableCopy = new variable.__proto__.constructor();
  for (let key in variable) {
    variableCopy[key] = variable[key]
  }
  return variableCopy
}

function hashJSON(json) {
  let hash = "|"
  Object.keys(json).forEach(key => {
    hash += key + ":" + json[key] + "|"
  })
  return hash
}

function computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws, startingHandSize = 7) {
  // lots of variables...
  const deckBinKeys = binKeySort(Object.keys(deckBins));
  const costBinKeys = binKeySort(Object.keys(costBins));
  const relevantBinTotals = Object.keys(relevantBinsMap).reduce((totals, costKey) => {
    totals[costKey] = 0;
    relevantBinsMap[costKey].forEach(binKeyIndex => {
      totals[costKey] += deckBins[deckBinKeys[binKeyIndex]];
    })
    return totals;
  }, {})
  const drawsRemaining = totalDraws;
  const costKeyIndex = 0;
  const relevantBinKeyIndex = 0;

  const amountOfCurrentTypeRemaining = costBins[costBinKeys[costKeyIndex]];
  const spaceRemainingForCurrent = relevantBinTotals[costBinKeys[costKeyIndex]] - deckBins[deckBinKeys[relevantBinsMap[costBinKeys[costKeyIndex]][relevantBinKeyIndex]]];

  const CMC = costBinKeys.reduce((cmc, costKey) => ["O", "T"].includes(costKey) ? cmc : cmc + costBins[costKey], 0); // converted mana cost
  const cache = {}; // to prevent a hand from being created two different ways
  const nCkCache = {}; // to make binomials faster
  const results = new Array(totalDraws - startingHandSize + 1).fill(0).map(n => new bigNum(n)); // our curve
  const handBins = {}; // data structure of the hand
  const costBinsPlacements = {}; // dict of binary masks
  costBinKeys.forEach(costBinKey => costBinsPlacements[costBinKey] = 0);
  deckBinKeys.forEach(deckBinKey => handBins[deckBinKey] = 0 );

  function countHandSymmetries(handBins, deckBinFulfilledMask, cardsDrawn) {

    let count = new bigNum(factorial(cardsDrawn))
    // basic count of hand symmetries
    for (handBinKey in handBins) {
      if (handBins[handBinKey] > 0) count = count.times(nCk(deckBins[handBinKey], handBins[handBinKey], nCkCache));
    }
    // count of hands which taplands prevent from working
    let problematicHandCount = new bigNum(0);

    const onCurve = cardsDrawn - 6 === CMC;

    // checking if all the lands in our hand could be taplands
    let allLandsCouldBeTapLands = Boolean(Object.keys(tapBins).length > 0);
    let handBinKeyIndex = 0;
    while (allLandsCouldBeTapLands && handBinKeyIndex < Object.keys(handBins).length) {
      let handBinKey = Object.keys(handBins)[handBinKeyIndex];
      if (handBinKey !== "O" && handBinKey !== "T,O" && handBins[handBinKey] > 0) allLandsCouldBeTapLands = allLandsCouldBeTapLands && handBins[handBinKey] <= tapBins[handBinKey] && (handBins[handBinKey] + tapBins[handBinKey] > 0);
      handBinKeyIndex++;
    }

    // if all our lands are taplands on curve it doesnt matter how much excess mana we have, we still can"t play the card
    if (onCurve && allLandsCouldBeTapLands) {
      let problematicHandsCausedByTapLandsOnCurve = new bigNum(1);
      let totalTaplands = 0;

      for (let i = 0; i < deckBinKeys.length; i++) {
        // choose all taplands, and count how many for later
        if (handBins[deckBinKeys[i]] > 0 && tapBins[deckBinKeys[i]] > 0) {
          problematicHandsCausedByTapLandsOnCurve = problematicHandsCausedByTapLandsOnCurve.times(nCk(tapBins[deckBinKeys[i]], handBins[deckBinKeys[i]], nCkCache));
          // dont want to double count when the max number of tap lands of this type are drawn and considered problematic because of their order
          // but that only happens if no overflow card have been placed s.t. deckKeyBinPrimeProductIds[deckBinKeys[i]] divides deckCostBinsFulfilledComposite 
          if ((deckBinFulfilledMask & (1 << i)) === 0) totalTaplands += handBins[deckBinKeys[i]];
        }
        // choose whatever
        else if (handBins[deckBinKeys[i]] > 0) {
          problematicHandsCausedByTapLandsOnCurve = problematicHandsCausedByTapLandsOnCurve.times(nCk(deckBins[deckBinKeys[i]], handBins[deckBinKeys[i]], nCkCache));
        }
      }

      // 9! orders to get such a version of this hand, but some will be counted by the next step of the process where we count the situations where a taplands is drawn last,
      // so here we only count the number of ways we do not draw a tapland last
      problematicHandCount = problematicHandCount.plus(problematicHandsCausedByTapLandsOnCurve.times(factorial(cardsDrawn - 1).times(cardsDrawn - totalTaplands)));
    }

    // for each deck bin...
    for (let i = 0; i < deckBinKeys.length; i++) {

      // if there are taplands in this deck bin AND it can still cause a problem
      const deckBinCanCauseProblem = tapBins[deckBinKeys[i]] > 0 && handBins[deckBinKeys[i]] > 0 && ((deckBinFulfilledMask & (1 << i)) === 0);
      if (deckBinCanCauseProblem) {

        // number of problematic hands begins at 1
        let problematicHandCausedByDeckBinCount = new bigNum(1);

        // multiply the number of problematic hands caused by this bin by a factor
        for (let j = 0; j < deckBinKeys.length; j++) {

          let factor;
          // if the deck bin we're checking is not the deck bin we"re adding a factor for, count the number of ways to choose the number in the hand bin by the number in the deck bin
          if (i !== j) factor = nCk(deckBins[deckBinKeys[j]], handBins[deckBinKeys[j]]);

          // if this is the problematic bin, the factor is the sum of the ways to choose N tap lands and H - N non tap lands
          // where H is the number of cards we"re taking from the bin total, and N ranges from the minium to the maximum number we can choose
          // each term is multiplied by the number of tap lands being chosen as that is the number of cards which can be last-drawn to create a problem
          else {

            let minTapLands = Math.max(1, handBins[deckBinKeys[j]] + tapBins[deckBinKeys[j]] - deckBins[deckBinKeys[j]]);
            const maxTapLands = Math.min(handBins[deckBinKeys[j]], tapBins[deckBinKeys[j]]);
            factor = new bigNum(0);

            while (minTapLands <= maxTapLands) {

              // (deck_bin_size - tap_bin_size CHOOSE hand_bin_size - tap_lands_chosen) * (tap_bin_size CHOOSE tap_lands_chosen) * tap_lands_chosen
              let term = nCk(deckBins[deckBinKeys[j]] - tapBins[deckBinKeys[j]], handBins[deckBinKeys[j]] - minTapLands, nCkCache).times(nCk(tapBins[deckBinKeys[j]], minTapLands, nCkCache)).times(minTapLands);
              factor = factor.plus(term);
              minTapLands++;

            }
          }

          // if the factor is > 0 we'll append it to our product, otherwise we"ll just leave it alone (representing a situation in which no tap lands could be chosen)
          if (factor.isGreaterThan(1)) problematicHandCausedByDeckBinCount = problematicHandCausedByDeckBinCount.times(factor);
        }

        // now that we've counted the number of hands which could cause problems given deck bin "i", we count the number of orders of said hand
        // this means multiplying by *(hand size - 1)!* because we know that a problematic tapland must be drawn last
        problematicHandCount = problematicHandCount.plus(problematicHandCausedByDeckBinCount.times(factorial(cardsDrawn - 1)));
      }
    }

    // subtract problematic hands and return count
    count = count.minus(problematicHandCount);
    return count;
  }

  function makeAbstractHands(handBinsCopy, costBinsPlacementsCopy, deckBinFulfilledMask, costKeyIndex, relevantBinKeyIndex, drawsRemaining, amountOfCurrentTypeRemaining, spaceRemainingForCurrent) {

    // checking if hand is playable and conditionally recording it
    const turn = totalDraws - drawsRemaining - startingHandSize; // zero indexed
    if ((turn + 1) >= CMC && turn >= 0) {
      const handHash = hashJSON(handBinsCopy);
      if (!cache[handHash]) {
        results[turn] = results[turn].plus(countHandSymmetries(handBinsCopy, deckBinFulfilledMask, totalDraws - drawsRemaining));
        cache[handHash] = true;
      }
    }
    
    // if we've exhausted the current cost bin, move on -or terminate-
    if (amountOfCurrentTypeRemaining === 0) {
      costKeyIndex++;
      if (costKeyIndex === costBinKeys.length) return;
      relevantBinKeyIndex = 0;
      amountOfCurrentTypeRemaining = costBins[costBinKeys[costKeyIndex]];
      spaceRemainingForCurrent = relevantBinTotals[costBinKeys[costKeyIndex]] - deckBins[deckBinKeys[relevantBinsMap[costBinKeys[costKeyIndex]][relevantBinKeyIndex]]];
    }
    let relevantCostBinKeyIndices = relevantBinsMap[costBinKeys[costKeyIndex]]; // deck keys which current cost key has edges to

    // if our cost key and our relevant bin key are still within bounds we can continue
    if (costKeyIndex < costBinKeys.length && relevantBinKeyIndex < relevantCostBinKeyIndices.length) {

      const relevantBinKey = deckBinKeys[relevantCostBinKeyIndices[relevantBinKeyIndex]];
      const min = 0; //Math.max(amountOfCurrentTypeRemaining - spaceRemainingForCurrent, 0) // TODO make this logic good
      const max = Math.min(deckBins[relevantBinKey] - handBinsCopy[relevantBinKey], amountOfCurrentTypeRemaining);
      let nextHandBinsCopy;
      let nextCostBinsPlacementsCopy;
      
      // add as few to as many cards as possible to this bin and move on to the next one (branch for each choice of how many)
      for (let i = min; i <= max; i++) {
        
        // copy of handBins updated for branching
        nextCostBinsPlacementsCopy = copyShallow(costBinsPlacementsCopy);
        nextHandBinsCopy = copyShallow(handBinsCopy);
        nextHandBinsCopy[relevantBinKey] += i;
        let nextDeckBinFulfilledMask = deckBinFulfilledMask;

        // updating info about which bins are "fulfilled" and which bins payed for which costs
        if (costBinKeys[costKeyIndex] === "O" && i > 0) {
          /*
          to fulfill a bin, or make a bin such that taplands cannot obstruct it, you must: 
            mark that the bin is fulfilled,
            if any unfulfilled deck bins which have balls placed in them from cost bins which this deck bin could fulfill exist, fulfill those as well
          */
          function fulfill(deckBinIndex) {
            if (nextDeckBinFulfilledMask & (1 << deckBinIndex)) return;
            nextDeckBinFulfilledMask = nextDeckBinFulfilledMask | (1 << deckBinIndex);
            relevantBinsReverseMap[deckBinKeys[deckBinIndex]].forEach(costBinKeyIndex => {
              let j = 0;
              while ((1 << j) <= costBinsPlacementsCopy[costBinKeys[costBinKeyIndex]]) {
                if (costBinsPlacementsCopy[costBinKeys[costBinKeyIndex]] & (1 << j)) fulfill(j);
                j++;
              }
            })
          }
          // since we're placing an overflow card in this bin we "fulfill" it
          fulfill(relevantCostBinKeyIndices[relevantBinKeyIndex]);

        } else if (i > 0) {
          // if we're placing a ball from one of our non-overflow cost bins, we record where to see which bins become fulfilled by overflow cards
          nextCostBinsPlacementsCopy[costBinKeys[costKeyIndex]] = nextCostBinsPlacementsCopy[costBinKeys[costKeyIndex]] | (1 << relevantCostBinKeyIndices[relevantBinKeyIndex]);
        }

        makeAbstractHands(nextHandBinsCopy, nextCostBinsPlacementsCopy, nextDeckBinFulfilledMask, costKeyIndex, relevantBinKeyIndex + 1, drawsRemaining - i, amountOfCurrentTypeRemaining - i, spaceRemainingForCurrent - deckBins[relevantBinKey]);
      }
    }
  }

  makeAbstractHands(handBins, costBinsPlacements, 0, costKeyIndex, relevantBinKeyIndex, drawsRemaining, amountOfCurrentTypeRemaining, spaceRemainingForCurrent);

  return postProcess(results, deckBins, startingHandSize, totalDraws, deckInfo, CMC, nCkCache);
}

module.exports = {
  computeProbabilities
}