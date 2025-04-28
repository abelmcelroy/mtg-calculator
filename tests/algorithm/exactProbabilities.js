const tap = require("tap");
const { 
  simpleSample1,
  simpleSample2,
  simpleSample3,
  sample1,
  sample2,
  ArborealGrazer,
  HydroidKrasis,
  Swamp,
  realMetaDeck1,
  VoltageSurge
} = require("../utils/sampleCards");
const { computeProbabilities } = require("../../src/probabilityCalculator");
const { preprocessInput } = require("../../src/probabilityCalculatorUtils.js");

(function simpleSample1Test(){
  let totalDraws = 8
  let { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(simpleSample1, ArborealGrazer, totalDraws)
  let curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  tap.same(curve, [
    { independent: "1", conditionalTargetDrawn: "1", conditionalEnoughLand: "1" },
    { independent: "1", conditionalTargetDrawn: "1", conditionalEnoughLand: "1" }
  ])
})();

(function simpleSample2Test(){
  let totalDraws = 8
  let { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(simpleSample2, ArborealGrazer, totalDraws)
  let curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  tap.same(curve, [
    { independent: "0", conditionalTargetDrawn: "0", conditionalEnoughLand: "0" },
    { independent: "0.98989898989898989899", conditionalTargetDrawn: "0.98989898989898989899", conditionalEnoughLand: "0.99190283400809716599" }
  ])
})();

(function simpleSample3Test(){
  let totalDraws = 8
  let { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(simpleSample3, ArborealGrazer, totalDraws)
  let curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  tap.same(curve, [
    { independent: "0.93333333333333333333", conditionalTargetDrawn: "1", conditionalEnoughLand: "0.93333333333333333333" },
    { independent: "0.97777777777777777778", conditionalTargetDrawn: "1", conditionalEnoughLand: "0.97777777777777777778" }
  ])
})();

(function sample1Test(){
  let totalDraws = 10
  let { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(sample1, HydroidKrasis, totalDraws)
  let curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  tap.same(curve, [
    { independent: "0", conditionalTargetDrawn: "0", conditionalEnoughLand: "0" },
    { independent: "0", conditionalTargetDrawn: "0", conditionalEnoughLand: "0" },
    { independent: "0.9979797979797979798", conditionalTargetDrawn: "0.9979797979797979798", conditionalEnoughLand: "0.9979797979797979798" },
    { independent: "1", conditionalTargetDrawn: "1", conditionalEnoughLand: "1" }
  ])
})();

(function sample2Test(){
  let totalDraws = 10
  let { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(sample2, HydroidKrasis, totalDraws)
  let curve = computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws);
  tap.same(curve, [
    { independent: "0", conditionalTargetDrawn: "0", conditionalEnoughLand: "0" },
    { independent: "0.98989898989898989899", conditionalTargetDrawn: "0.99190283400809716599", conditionalEnoughLand: "0.98989898989898989899" },
    { independent: "0.9989898989898989899", conditionalTargetDrawn: "0.9989898989898989899", conditionalEnoughLand: "0.9989898989898989899" },
    { independent: "1", conditionalTargetDrawn: "1", conditionalEnoughLand: "1" }
  ])
})();

tap.test("turn 1 drop on turn 1 should result in same values if tap lands are replaced with useless cards", tap => {
  const totalDraws = 7
  const { deckBins: deckBins1, costBins: costBins1, tapBins: tapBins1, relevantBinsMap: relevantBinsMap1, relevantBinsReverseMap: relevantBinsReverseMap1, deckInfo: deckInfo1 } = preprocessInput(realMetaDeck1, VoltageSurge, totalDraws)
  const { deckBins: deckBins2, costBins: costBins2, tapBins: tapBins2, relevantBinsMap: relevantBinsMap2, relevantBinsReverseMap: relevantBinsReverseMap2, deckInfo: deckInfo2 } = preprocessInput(realMetaDeck1.map(c => c.name.includes("X") ? { ...Swamp, quantity: c.quantity } : c), VoltageSurge, totalDraws)
  const curve1 = computeProbabilities(deckBins1, costBins1, tapBins1, relevantBinsMap1, relevantBinsReverseMap1, deckInfo1, totalDraws);
  const curve2 = computeProbabilities(deckBins2, costBins2, tapBins2, relevantBinsMap2, relevantBinsReverseMap2, deckInfo2, totalDraws);
  tap.same(curve1, curve2);
  tap.end();
});