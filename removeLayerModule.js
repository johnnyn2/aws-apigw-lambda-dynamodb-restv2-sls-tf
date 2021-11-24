const readline = require('readline');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require('./config.json');

const { defaultLambdaLayerSrcPath } = config;

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        }),
    );
}

(async function () {
    try {
        console.log(
            'Default lambda layer source path: ',
            defaultLambdaLayerSrcPath,
        );
        const layerPath = await askQuestion(
            '1. What is the module path? E.g. service/user-service\n',
        );
        const layer = `${defaultLambdaLayerSrcPath}${layerPath}`;
        if (fs.existsSync(layer)) {
            console.log('\nRemoving module...');
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
    } catch (e) {
        console.error(e);
    }
})();
