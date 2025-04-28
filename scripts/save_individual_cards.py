import json
import re

from card_transformation_utils import scryfall_to_local_format

# for creatign the file name for a given card, without funking up the file extension or dir structure
file_name = lambda card_name: "./data/cards/" + card_name.replace("/", "-").replace(".", "") + ".json"

with open("./data/default_cards.json", encoding="utf-8", mode="r") as default_card_file:
  line = default_card_file.readline()

  while line:
    # making sure the current line has valid JSON within it
    match = re.search(r"\{.*\}", line)

    if match: 
      # load the JSON as a dict
      card = json.loads(line[match.span()[0]:match.span()[1]])
      
      with open(file_name(card["name"].lower()), encoding="utf-8", mode="w+") as card_file:
        
        # writing the card to a JSON file
        card_file.write(json.dumps(scryfall_to_local_format(card)))
    
    line = default_card_file.readline()