import re

def card_type(card):
  if "type_line" in card:
    return "Land" if "land" in card["type_line"].lower() else "Nonland"
  else:
    return None

def produced_mana(card):
  if card_type(card) != "Land":
    return None

  elif "card_faces" in card:
    colors = []
    for face in card["card_faces"]:
      match = re.match(r"^(.*?|\n)?\{T\}:.*?[Aa]dd(.+?\{(([A-Z]\/?)+?)\})+", face["oracle_text"])
      if match:
        new_colors = sum([mana.split("/") for mana in re.findall(r"\{([^T]+)\}", face["oracle_text"][match.span()[0]:match.span()[1]])], [])
        colors += new_colors
    return ",".join(list(set(colors))) or None

  elif "produced_mana" in card:
    return ",".join(card["produced_mana"])

  else:
    return None

def tap_land(card):
  if card_type(card) != "Land":
    return None

  has_tap_land_phrase = lambda c: re.search(f"(NAME enters the battlefield tapped.(?!unless))|(Hideaway)|(NAME enters tapped)", c["oracle_text"].replace(c["name"], "NAME")) != None
  is_tap_land = None

  if "card_faces" in card:
    for face in card["card_faces"]:
      if card_type(face) == "Land":
        is_tap_land = has_tap_land_phrase(face)
  else:
    is_tap_land = has_tap_land_phrase(card)
    

  return is_tap_land

def mana_cost(card):
  cost = None
  if "card_faces" in card:
    for face in card["card_faces"]:
      if "mana_cost" in face and face["mana_cost"]:
        cost = face["mana_cost"]
  elif "mana_cost" in card:
    cost = card["mana_cost"]
  return cost


# methods for transforming raw card data to the specific felids for the format that the probability calculator uses
transformation_lookup = {
  "mana_cost": mana_cost,
  "types": lambda card: card["type_line"] if "type_line" in card else None,
  "type": card_type,
  "producible_mana_colors": produced_mana,
  "tap_land": tap_land
}

# function that generates a card in the format the probability calculator uses
def scryfall_to_local_format(scryfall_card):
  card = { "name": scryfall_card["name"] }

  for key in transformation_lookup:
    transformed_value = transformation_lookup[key](scryfall_card)
    if transformed_value != None:
      card[key] = transformed_value

  return card

__all__ = scryfall_to_local_format