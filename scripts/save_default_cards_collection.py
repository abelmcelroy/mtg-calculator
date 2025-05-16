import requests
import json

# check out scryfall to get most recent bulk data
scryfall_bulk_data = requests.get("https://api.scryfall.com/bulk-data")
# find the uri for the "default_cards" collection
default_cards_uri = next((bulk_data for bulk_data in json.loads(scryfall_bulk_data.text)["data"] if bulk_data["type"] == "default_cards"), None)["download_uri"] # type: ignore
# request the "default_cards" collection
default_cards = requests.get(default_cards_uri)
# write the response to a JSON file
with open("./data/default_cards.json", encoding="utf-8", mode="w+") as file:
  file.write(default_cards.text)