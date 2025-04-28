/**
 * @ScryfallType
 */

export interface PartialScryfallCard {
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  produced_mana?: string[];
  card_faces?: CardFace[];
  quantity?: number;
  [key: string]: any;
};

export interface CardFace {
  name?: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
};

/**
 * @AlgoOutputs
 */

export type Probability = number; // between 0-1, up to 20 decimal places

export enum ProbabilityTypes {
  independent = "independent",
  conditionalTargetDrawn = "conditionalTargetDrawn",
  conditionalEnoughLand = "conditionalEnoughLand",
};

export type ProbabilitiesOnGivenTurn = {
  [key in ProbabilityTypes]: Probability;
};

export type AlgoResult = ProbabilitiesOnGivenTurn[];

export type Calculations = {
  calculations: ProbabilitiesOnGivenTurn[],
  simulated: boolean,
};

/**
 * @AlgoInputs
 */

export type AlgoOptions = {
  maxComplexity?: number,
  upToTurn?: number,
  simulationOptions?: {
    iterations?: number
  };
};

export enum CardType {
  Nonland = "Nonland",
  Land = "Land",
};

export type Card = {
  name: string,
  mana_cost: string, // example: "{W}{W}{3}"
  types: string, // example: "Land - Enchantment" (see `./scripts/card_transformation_utils.py`)
  type: CardType,
  producible_mana_colors: string, // example: "G,W,C"
  tap_land: boolean,
  quantity: number,
};

export type Deck = Card[];

export type DeckLookup = {
  [deckname: string]: Deck
};

export type DeckBins = {
  [mana_types: string]: number, // how many cards can produce the given combination of mana types in the deck
} | {};

export type CostBins = {
  [mana_type: string]: number, // how many of any of the given mana types need to be paid for a specific part of the mana cost of a card
} | {};

export type TapBins = {
  [mana_types: string]: number, // how many cards that come into play tapped and can produce the given combination of mana types in the deck 
} | {};

export type RelevantBinsMap = {
  [mana_type: string]: number[], // a list of indices of the keys in the deckBins which are able to pay for a given mana type in the costBins
} | {};

export type RelevantBinsReverseMap = {
  [mana_types: string]: number[], // a list of indices of keys in the costBins which can be paid by a given mana type combination from the deckBins
} | {};

export type DeckInfo = {
  targetCardCount: number, // total target cards in the deck
  landCount: number // total lands in the deck
} | {};

export type PreprocessedAlgoInput = {
  deckBins: DeckBins,
  costBins: CostBins,
  tapBins: TapBins,
  relevantBinsMap: RelevantBinsMap,
  relevantBinsReverseMap: RelevantBinsReverseMap,
  deckInfo: DeckInfo,
  totalDraws?: number,
};

export type AlgoInput = {
  deckBins: DeckBins,
  costBins: CostBins,
  tapBins: TapBins,
  relevantBinsMap: RelevantBinsMap,
  relevantBinsReverseMap: RelevantBinsReverseMap,
  deckInfo: DeckInfo,
  totalDraws: number,
};

export type AlgoInputsHash = string; // a murmur hash v3 of the an AlgoInput