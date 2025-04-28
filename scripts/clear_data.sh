#!/bin/bash

# removes the JSON files for individual cards and sets, not the default cards JSON
if [ "$1" == "--all" ];
then
  find ./data/cards -not -name '.gitignore' -type f -delete
  find ./data/tries -not -name '.gitignore' -type f -delete
fi
find ./data/cache -not -name '.gitignore' -type f -delete