#!/bin/bash

if [ "$2" == "-f" ];
then
  rm ./data/cache/"$1".json
fi

if !(test -f ./data/cache/"$1".json);
then
  curl https://api.scryfall.com/cards/named?fuzzy="$1" > ./data/cache/"$1".json
fi