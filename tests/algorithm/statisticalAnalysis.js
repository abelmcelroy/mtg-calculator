const tap = require("tap");
const { 
  simpleSample1,
  simpleSample2,
  simpleSample3,
  sample1,
  sample2,
  realDataDeck1,
  realDataDeck2,
  realDataDeck3,
  realDataDeck4,
  realMetaDeck1,
  ArborealGrazer,
  HydroidKrasis,
  Island,
  Vizzerdrix,
  EvelyntheCovetous,
  CorpseAppraiser,
  ReckonerBankbuster,
  VoltageSurge,
  Treva,
  ThistledownLiege,
  NosyGoblin,
  copies
} = require("../utils/sampleCards.js");
const { simulateDraws } = require("../../src/statisticalSimulator.js");
const { computeProbabilities } = require("../../src/probabilityCalculator.js");
const { preprocessInput, sum } = require("../../src/probabilityCalculatorUtils.js");

const ITERATIONS = 100000;
const STD_ERR = 1 / Math.sqrt(ITERATIONS);

function compareStatsToProbs(stats, probs, t = tap) {
  t.test("Probabilities and Statistics should behave normally", t => {
    // this bell curve represents how many SEs different from the probability the statistical approximations are
    //                -3σ -2σ -σ  0  +σ +2σ +3σ  
    const bellCurve = [0,  0,  0, 0, 0,  0,  0];
    const bellCurvesByType = {};

    Object.keys(stats[0]).forEach(type => bellCurvesByType[type] = [0, 0, 0, 0, 0, 0, 0]);

    stats.forEach((statInfoObj, turnIndex) => {
      const probsInfoObj = probs[turnIndex];
      Object.keys(statInfoObj).forEach(statKey => {
        const statNum = parseFloat(statInfoObj[statKey]);
        const probNum = parseFloat(probsInfoObj[statKey]);
        
        // round down if above 0, round up if below 0;
        const σ = Math[statNum > probNum ? "floor" : "ceil"]((statNum - probNum) / STD_ERR);
        const σIndexClipped = σ < -3 ? 0 : σ > 3 ? 6 : σ+3;
        bellCurve[σIndexClipped]++;
        bellCurvesByType[statKey][σIndexClipped]++;
      });
    });
    const population = bellCurve.reduce(sum);

    const statChecks = {
      "-3σ": () => bellCurve[0] <= Math.floor(population * .001),
      "-2σ": () => bellCurve[1] <= Math.ceil(population * .021),
      "-1σ": () => bellCurve[2] <= Math.ceil(population * .136),
      "+1σ": () => bellCurve[4] <= Math.ceil(population * .136),
      "+2σ": () => bellCurve[5] <= Math.ceil(population * .021),
      "+3σ": () => bellCurve[6] <= Math.floor(population * .001),
    }

    const sigmaSizes = {
      "-3σ": "0.1%",
      "-2σ": "2.1%",
      "-1σ": "13.6%",
      "+1σ": "13.6%",
      "+2σ": "2.1%",
      "+3σ": "0.1%"
    }

    Object.keys(statChecks).forEach((σ, i) => {
      const bellCurveIndex = i < 3 ? i : i + 1;
      const message = `${σ} should not exceed ${sigmaSizes[σ]} of population: (${bellCurve[bellCurveIndex]}/${population})`;
      
      // test if there are too many results with this number of SEs
      t.ok(statChecks[σ](), message);
      
      // if so find which type of probability the statistics aren't approximating well
      if (!statChecks[σ]()) {
        let culpritFlag = false;
        const culpritCheck = (type) => bellCurvesByType[type][bellCurveIndex] <= bellCurve[bellCurveIndex]/3;
        const culpritMessage = (type) => `"${type}" is disproportionately represented in the ${σ} range: (${bellCurvesByType[type][bellCurveIndex]}/${bellCurve[bellCurveIndex]})`;
        
        Object.keys(bellCurvesByType).forEach(type => {
          if (!culpritCheck(type)) {
            culpritFlag = true;
            t.ok(culpritCheck(type), culpritMessage(type));
          }
        });
        
        if (!culpritFlag) {
          t.notOk(true, `no one statistic is responsible for skewing the ${σ} results, the calculator may be faulty`);
        }
      }
    });

    t.end();
  });;
};

function testDeck(deck, targetCard, totalDraws, t = tap) {
  const { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(deck, targetCard, totalDraws);
  const curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  const stats = simulateDraws(deckBins, tapBins, costBins, deckInfo, totalDraws - 6, ITERATIONS, 7);
  compareStatsToProbs(stats, curve, t);
}

tap.test("should def handle simple collections of cards", t => {
  testDeck(simpleSample1, ArborealGrazer, 8, t);
  testDeck(simpleSample2, ArborealGrazer, 12, t);
  testDeck(simpleSample3, ArborealGrazer, 8, t);
  t.end();
});

tap.test("should handle mid sized collections of cards", t => {
  testDeck(sample1, HydroidKrasis, 10, t);
  testDeck(sample2, ArborealGrazer, 10, t);
  t.end();
});

tap.test("should handle real data", t => {
  testDeck, ([
    copies(Island, 14),
    copies(Vizzerdrix, 1),
  ], Vizzerdrix, 15, t);
  testDeck(realDataDeck1, Treva, 16, t);
  testDeck(realDataDeck2, Vizzerdrix, 16, t);
  testDeck(realDataDeck3, ThistledownLiege, 16, t);
  testDeck(realDataDeck4, NosyGoblin, 20, t);
  t.end();
});

tap.test("should handle real decks!", t => {
  testDeck(realMetaDeck1, VoltageSurge, 17, t);
  testDeck(realMetaDeck1, EvelyntheCovetous, 17, t);
  testDeck(realMetaDeck1, CorpseAppraiser, 17, t);
  testDeck(realMetaDeck1, ReckonerBankbuster, 17, t);
  t.end();
});