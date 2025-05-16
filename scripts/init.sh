#!/bin/bash

# You will need python3 and Node ^v16
set -e

echo "installing dependancies..."
npm install
pip3 install -r requirements.txt

echo "gathering data..."
./scripts/clear_data.sh --all
./scripts/get_all_data.sh

echo "making sure things look good"
npm run typecheck
npm run tests