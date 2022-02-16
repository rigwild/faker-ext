yarn run esbuild --bundle --outdir=dist $(find src/*.ts) && yarn run esbuild --bundle --outdir=dist/content_scripts $(find src/content_scripts/*.ts) && /
    cp src/manifest.json dist/ && rm -rf dist/content_scripts/lib.js dist/config.js && /
    cp -r public dist/