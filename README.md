# MtG Calculator

## Installation
```bash
npm i mtg-calculator
```

## Getting started
```
import { computeCurve } from 'mtg-calc';

const island = {
  name: 'Island',
  quantity: 15,
  mana_cost: '',
  types: 'Basic Land — Island',
  type: 'Land',
  producible_mana_colors: 'U',
  tap_land: false
};

const vizzerdrix = {
  name: 'Vizzerdrix',
  quantity: 1,
  mana_cost: '{6}{U}',
  types: 'Creature — Rabbit Beast',
  type: 'Nonland'
};

const deck = [
  island,
  vizzerdrix,
];

const { calculations } = computeCurve(vizzerdrix, deck);

console.log(calculations); /* -> [
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0',
      conditionalTargetDrawn: '0',
      conditionalEnoughLand: '0'
    },
    {
      independent: '0.8125',
      conditionalTargetDrawn: '1',
      conditionalEnoughLand: '0.8125'
    }
  ]
  */
```

## API

### `computeCurve(card, deck, options)`
Returns an array of probabilities of being able to play the given card from the given deck, on the given turn. Where the index of the calculation in the list is `turn - 1`.

**Parameters:**
- `card` (Card, required): minimal card object transformed from Scryfall's API
- `deck` (Card[], required): a list of cards
- `options` (AlgoOptions, optional): configuration options, see types below for more info

**Returns:** Object (Calculations): list of calculations for each turn (in order starting from turn 1), and a flag to denote if simulations were used.

### `scryfallToCard(card)`
Transforms a card object directly from the Scryfall API (or an object implementing the PartialScryfallCard interface), into a usable card object for `computeCurve`.

**Parameters:**
- `card` (PartialScryfallCard | CardFace, required): The card to transform into usable input for calculations

**Returns:** Object (Card): The object type/structure for creating decks and computing probabilities with.

## Types

```typescript
// Based off of Scryfall.com's API, see https://scryfall.com/docs/api/cards for more info
interface PartialScryfallCard {
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  produced_mana?: string[];
  card_faces?: CardFace[];
  quantity?: number;
  [key: string]: any;
}

interface CardFace {
  name?: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
}

// Inputs:
type AlgoOptions = {
  maxComplexity?: number, // default: 30,000 — a threshold that when crossed causes the algorithm to fallback on a statistical simulation. If set to 0, will never fallback on simulations
  upToTurn?: number, // default: card CMC — how long the list of calculations should be
  simulationOptions?: {
    iterations?: number // default: 10,000 - how many iterations of the simulation should be done when complexity threshold is crossed
  };
}

type Card = {
  name: string,
  mana_cost: string, // example: "{W}{W}{3}"
  types: string, // example: "Land - Enchantment"
  type: CardType,
  producible_mana_colors: string, // example: "G,W,C"
  tap_land: boolean,
  quantity: number,
}

enum CardType {
  Nonland = "Nonland",
  Land = "Land",
}

type Deck = Card[]

// Outputs
type Calculations = {
  calculations: ProbabilitiesOnGivenTurn[],
  simulated: boolean,
}

type ProbabilitiesOnGivenTurn = {
  [key in ProbabilityTypes]: Probability;
}

enum ProbabilityTypes {
  independent = "independent", // P of being able to draw and play the card
  conditionalTargetDrawn = "conditionalTargetDrawn", // P of being able to play the card, given it was drawn
  conditionalEnoughLand = "conditionalEnoughLand", // P of being able to draw and play the card given enough lands to play its CMC
}

type Probability = string // representing a number between 0-1, up to 20 decimal places
```

## License
This project is licensed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).  
**Non-commercial use only.** For commercial use, contact abel.h.mcelroy@gmail.com