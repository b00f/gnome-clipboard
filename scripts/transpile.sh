#!/bin/sh

# Uncommetn this if you want to see the commands
# set -ex

pwd=$(pwd)

# In goes standard JS. Out comes GJS-compatible JS
transpile() {
    cat ${src} | sed -e 's#export function#function#g' \
        -e 's#export var#var#g' \
        -e 's#export const#var#g' \
        -e 's#Object.defineProperty(exports, "__esModule", { value: true });#var exports = {};#g' \
        | sed -E 's/export class (\w+)/var \1 = class \1/g' \
        | sed -E "s/import \* as (\w+) from '(\w+)'/const \1 = Me.imports.\2/g" > ${dest}
}

rm -rf dist src/build
mkdir -p dist/

# Transpile to JavaScript
tsc --p ./src &

wait

# Convert JS to GJS-compatible scripts
cp -r README.md LICENSE metadata.json schemas src/*.css po dist &

for src in $(find src/build -name '*.js'); do
    dest=$(echo $src | sed s#src/build#dist#g)
    transpile &
done

wait