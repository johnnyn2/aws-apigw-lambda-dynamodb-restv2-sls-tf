const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require('./config.json');

const { defaultLambdaLayerSrcPath } = config;

(async function () {
    try {
        for (let i = 2; i < process.argv.length; i++) {
            const layerPath = process.argv[i];
            const layer = `${defaultLambdaLayerSrcPath}${layerPath}`;
            if (fs.existsSync(layer)) {
                console.log('Removing module...');
                await fs.promises.rm(layer, { recursive: true });
                console.log('Done!');
                const modulePath = layerPath.split('/');
                console.log('Uninstalling module from node_modules');
                const dependency = modulePath[modulePath.length - 1];
                await exec(`npm uninstall ${dependency}`);
                console.log(
                    `Done! package.json removed ${dependency} dependency\n`,
                );
            } else {
                throw new Error('Module does not exist!');
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
