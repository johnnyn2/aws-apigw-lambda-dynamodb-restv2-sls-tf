const readline = require('readline');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const defaultLambdaLayerSrcPath = 'src/layer/';

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

const tplFn = `function example() {}

module.exports = {
    example,
};
`;

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
            throw new Error('Module already exists!');
        } else {
            await fs.promises.mkdir(layer, { recursive: true });
            const index = `${layer}/index.js`;
            await fs.promises.writeFile(index, tplFn);
            console.log('\nInitializing module...');
            await exec('npm init -y', { cwd: layer });
            console.log('Done!');
            console.log('Installing your module into node_modules...');
            await exec(`npm install file:${layer}`);
            console.log('Done!');
            console.log(
                `\nYou can write your module code in ${index} now. Remember to export data from your module.\n`,
            );
        }
    } catch (e) {
        console.error(e);
    }
})();
