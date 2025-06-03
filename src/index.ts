import { complexity, convertedManaCost, preprocessInput } from "./probabilityCalculatorUtils.js";
import { computeProbabilities } from "./probabilityCalculator.js";
import { simulateDraws } from "./statisticalSimulator.js";
import { Card, Deck, PreprocessedAlgoInput, AlgoInput, AlgoResult, AlgoOptions, Calculations } from "./types";

const DEFAULT_MAX_COMPLEXITY = 30000;
const DEFAULT_SIMULATION_ITERATIONS = 10000;

function generateAlgoInputs(card: Card, deck: Deck, turn?: number): AlgoInput {
  const CMC: number = convertedManaCost(card);
  const totalDraws = (turn ?? CMC) + 6;
  const algoInputs: PreprocessedAlgoInput = preprocessInput(deck, card, totalDraws);
  algoInputs.totalDraws = totalDraws; // this ensured the type is AlgoResult (stronger) rather than PreprocessedAlgoInput (weaker), so coercion on next line is OK
  return algoInputs as AlgoInput;
}

export function computeCurve(card: Card, deck: Deck, options?: AlgoOptions): Calculations {
  const { deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws } = generateAlgoInputs(card, deck, options?.upToTurn);
  let results: Calculations;
  const maxComplexity = options?.maxComplexity ?? DEFAULT_MAX_COMPLEXITY;
  const simulationIterations = options?.simulationOptions?.iterations ?? DEFAULT_SIMULATION_ITERATIONS;

  if (maxComplexity > 0) {
    const complexityEstimate: number = complexity(relevantBinsMap, costBins).toNumber();
  
    if (complexityEstimate < maxComplexity) {
      results = {
        calculations: computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws) as AlgoResult,
        simulated: false
      }
    } else {
      results = {
        calculations: simulateDraws(deckBins, tapBins, costBins, totalDraws - 6, simulationIterations) as AlgoResult,
        simulated: true
      }
    }
  } else {
    results = {
      calculations: computeProbabilities(deckBins, costBins, tapBins, relevantBinsMap, relevantBinsReverseMap, deckInfo, totalDraws) as AlgoResult,
      simulated: false
    }
  }
  return results;
}

export { scryfallToCard } from "./cardTransformationUtils";
export { PartialScryfallCard, CardFace, CardType, Card, Deck, AlgoOptions, Calculations, ProbabilitiesOnGivenTurn, ProbabilityTypes, Probability } from "./types";

