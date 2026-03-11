#!/bin/bash

# Update spot links in all files
find src -name "*.tsx" -type f ! -path "*/[*" -exec sed -i 's|href={\`/spots/\${[^}]*\.id}\`|href={getSpotUrl((spot?.city?.name || mission?.spot?.city?.name || tip?.spot?.city?.name || vibe?.spot?.city?.name || "\''Bangkok\''"), (spot?.name || mission?.spot?.name || tip?.spot?.name || vibe?.spot?.name))}|g' {} \;

# Update scam-alerts links
find src -name "*.tsx" -type f ! -path "*/[*" -exec sed -i 's|href={\`/scam-alerts/\${[^}]*\.id}\`|href={getScamAlertUrl((scam?.city?.name || "Bangkok"), scam?.scamName)}|g' {} \;

echo "Links updated"
