const tap = require("tap");
const { preprocessInput } = require("../../src/probabilityCalculatorUtils.js");
const { copies } = require("../utils/sampleCards.js");
const [
  Forest,
  Island,
  Plains,
  SeasideCitidel,
  Treva,
  BantCharm,
  Vizzerdrix,
  ThistledownLiege,
  NosyGoblin
] = [
  require("../../data/cards/Forest.json"),
  require("../../data/cards/Island.json"),
  require("../../data/cards/Plains.json"),
  require("../../data/cards/Seaside\ Citadel.json"),
  require("../../data/cards/Treva\,\ the\ Renewer.json"),
  require("../../data/cards/Bant\ Charm.json"),
  require("../../data/cards/Vizzerdrix.json"),
  require("../../data/cards/Thistledown\ Liege.json"),
  require("../../data/cards/Nosy\ Goblin.json"),
];

function findUndefinedValues(obj) {
  if (typeof obj === "object") {
    return Object.keys(obj).some(key => findUndefinedValues(obj[key]))
  } else {
    return obj === undefined;
  }
}

(function preprocessingSmallDeck() {
  const totalDraws = 7;
  const deck = [
    copies(Island, 10),
    copies(Vizzerdrix, 5)
  ];
  
  const { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(deck, Vizzerdrix, totalDraws);
  
  tap.notOk(findUndefinedValues(deckBins));
  tap.notOk(findUndefinedValues(costBins));
  tap.notOk(findUndefinedValues(tapBins));
  tap.notOk(findUndefinedValues(relevantBinsMap));
  tap.notOk(findUndefinedValues(relevantBinsReverseMap));
  tap.notOk(findUndefinedValues(deckInfo));
})();

(function preprocessingSmallDeck() {
  const totalDraws = 11;
  const deck = [
    copies(Plains, 8),
    copies(Forest, 8),
    copies(Island, 8),
    copies(SeasideCitidel, 4),
    copies(BantCharm, 4),
    copies(Treva, 1),
    copies(Vizzerdrix, 27),
  ];
  
  const { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(deck, Treva, totalDraws);
  
  tap.notOk(findUndefinedValues(deckBins));
  tap.notOk(findUndefinedValues(costBins));
  tap.notOk(findUndefinedValues(tapBins));
  tap.notOk(findUndefinedValues(relevantBinsMap));
  tap.notOk(findUndefinedValues(relevantBinsReverseMap));
  tap.notOk(findUndefinedValues(deckInfo));
})();


(function preprocessingSmallDeck() {
  const totalDraws = 11;
  const deck = [
    copies(Plains, 8),
    copies(Forest, 8),
    copies(Island, 8),
    copies(SeasideCitidel, 4),
    copies(BantCharm, 4),
    copies(Treva, 1),
    copies(ThistledownLiege, 4),
    copies(NosyGoblin, 3),
    copies(Vizzerdrix, 20),
  ];
  
  const { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo } = preprocessInput(deck, Treva, totalDraws);
  
  tap.notOk(findUndefinedValues(deckBins));
  tap.notOk(findUndefinedValues(costBins));
  tap.notOk(findUndefinedValues(tapBins));
  tap.notOk(findUndefinedValues(relevantBinsMap));
  tap.notOk(findUndefinedValues(relevantBinsReverseMap));
  tap.notOk(findUndefinedValues(deckInfo));
})();