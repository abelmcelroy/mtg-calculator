#!/bin/bash

if ! command -v jq &> /dev/null
then
  brew install jq
fi

# incrememnt data version
jq '.VERSION += 1' ./data/version.json > ./data/version.json.tmp && cp ./data/version.json.tmp ./data/version.json && rm ./data/version.json.tmp

python3 ./scripts/save_default_cards_collection.py
echo "CREATED - default_cards.json"
python3 ./scripts/save_individual_cards.py
echo "CREATED - individual MTG cards"