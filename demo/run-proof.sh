#!/usr/bin/env bash
# Reproducible proof run for Continuity Keeper on Walrus Mainnet.
# Establishes real canon, then demonstrates TRUE supersession:
# a superseded fact stops surfacing in recall, while its blob persists on Walrus.
set -euo pipefail
cd "$(dirname "$0")/.."
c() { node tools/continuity/cli.mjs "$@"; }
S=saltglass

echo "### 1. Establish canon (real mainnet writes) ###"
c remember-bulk --story $S --type char    --entity "Elara"           --facts-file demo/canon/elara.txt
c remember-bulk --story $S --type char    --entity "Kane"            --facts-file demo/canon/kane.txt
c remember-bulk --story $S --type char    --entity "Mother Vess"     --facts-file demo/canon/vess.txt
c remember-bulk --story $S --type place   --entity "Ravengard"       --facts-file demo/canon/ravengard.txt
c remember-bulk --story $S --type place   --entity "the Fold"        --facts-file demo/canon/the-fold.txt
c remember-bulk --story $S --type object  --entity "the Sunblade"    --facts-file demo/canon/sunblade.txt
c remember-bulk --story $S --type object  --entity "Elara's pendant" --facts-file demo/canon/pendant.txt
c remember-bulk --story $S --type rule    --entity "Cost of the Fold" --facts-file demo/canon/cost-of-the-fold.txt
c remember-bulk --story $S --type events                              --facts-file demo/canon/events.txt
c remember-bulk --story $S --type timeline                            --facts-file demo/canon/timeline.txt

echo; echo "### 2. Recall Elara BEFORE Ch.7 (canon says: alive) ###"
c recall --story $S --type char --entity "Elara" --query "Is Elara alive or dead?"

echo; echo "### 3. Ch.7 — Elara dies at the Fold. SUPERSEDE (forget the namespace + rewrite current facts) ###"
c supersede --story $S --type char --entity "Elara" --facts-file demo/canon/elara--after-ch7.txt

echo; echo "### 4. Recall Elara AFTER (canon now: dead — the 'alive' fact no longer surfaces) ###"
c recall --story $S --type char --entity "Elara" --query "Is Elara alive or dead?"

echo; echo "### 5. The pendant passes to Kane. SUPERSEDE ###"
c supersede --story $S --type object --entity "Elara's pendant" --facts-file demo/canon/pendant--after-ch7.txt

echo; echo "### 6. Export the current story bible ###"
c export --story $S

echo; echo "### 7. Proof summary ###"
c count
