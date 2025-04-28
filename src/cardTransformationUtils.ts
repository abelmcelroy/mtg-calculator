import { PartialScryfallCard, CardFace, Card } from "./types";

function cardType(card: PartialScryfallCard | CardFace): string | null {
  if ("type_line" in card) {
    return card["type_line"].toLowerCase().includes("land") ? "Land" : "Nonland";
  } else {
    return null;
  }
}

function producedMana(card: PartialScryfallCard): string | null {
  if (cardType(card) !== "Land") {
    return null;
  }

  else if ("card_faces" in card) {
    const colors: string[] = [];
    for (const face of card["card_faces"]) {
      const match = face.oracle_text?.match(/^(.*?|\n)?\{T\}:.*?[Aa]dd(.+?\{(([A-Z]\/?)+?)\})+/);
      if (match) {
        const newColors = face.oracle_text!
          .substring(match.index!, match.index! + match[0].length)
          .match(/\{([^T]+)\}/g)
          ?.map(mana => mana.substring(1, mana.length - 1))
          .flatMap(mana => mana.split("/")) || [];
        colors.push(...newColors);
      }
    }
    return [...new Set(colors)].join(",") || null;
  }

  else if ("produced_mana" in card) {
    return card["produced_mana"]?.join(",");
  }

  else {
    return null;
  }
}

function tapLand(card: PartialScryfallCard): boolean | null {
  if (cardType(card) !== "Land") {
    return null;
  }

  const hasTapLandPhrase = (c: PartialScryfallCard | CardFace): boolean => {
    return c.oracle_text ? 
      RegExp(`(NAME enters the battlefield tapped.(?!unless))|(Hideaway)|(NAME enters tapped)`)
        .test(c.oracle_text.replace(c.name!, "NAME")) : 
      false;
  };
  
  let isTapLand: boolean | null = null;

  if ("card_faces" in card) {
    for (const face of card["card_faces"]!) {
      if (cardType(face) === "Land") {
        isTapLand = hasTapLandPhrase(face);
      }
    }
  } else {
    isTapLand = hasTapLandPhrase(card);
  }
    
  return isTapLand;
}

function manaCost(card: PartialScryfallCard): string | null {
  let cost: string | null = null;
  if ("card_faces" in card) {
    for (const face of card["card_faces"]!) {
      if ("mana_cost" in face && face["mana_cost"]) {
        cost = face["mana_cost"];
      }
    }
  } else if ("mana_cost" in card) {
    cost = card["mana_cost"];
  }
  return cost;
}


type TransformationFunction = (card: PartialScryfallCard) => string | boolean | null;

const transformationLookup: Record<string, TransformationFunction> = {
  "mana_cost": manaCost,
  "types": (card: PartialScryfallCard): string | null => "type_line" in card ? card["type_line"] : null,
  "type": cardType as TransformationFunction,
  "producible_mana_colors": producedMana,
  "tap_land": tapLand
};

export function scryfallToCard(partialScryfallCard: PartialScryfallCard): Card {
  const card: Partial<Card> = { name: partialScryfallCard.name };

  for (const key in transformationLookup) {
    const transformedValue = transformationLookup[key](partialScryfallCard);
    if (transformedValue !== null) {
      (card as any)[key] = transformedValue;
    }
  }

  return card as Card;
}