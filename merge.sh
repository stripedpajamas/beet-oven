set -e

rm -f temp-assets/.DS_Store

if [ ! -z "$(ls -A temp-assets)" ]; then
  mv temp-assets/* site/assets
fi

mv site/toc.json site/toc.json.bak
jq --slurpfile toc site/toc.json.bak --slurpfile tocNew temp-toc.json -n '$toc[0] + $tocNew[0]' > site/toc.json
rm -f site/toc.json.bak
