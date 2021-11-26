const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require('./config.json');

const { defaultLambdaLayerSrcPath } = config;

const tplFn = `function example() {}

module.exports = {
    example,
};
`;

(async function () {
    try {
        for (let i = 2; i < process.argv.length; i++) {
            const layerPath = process.argv[i];
            const layer = `${defaultLambdaLayerSrcPath}${layerPath}`;
            if (fs.existsSync(layer)) {
                throw new Error('Module already exists!');
            } else {
                await fs.promises.mkdir(layer, { recursive: true });
                const index = `${layer}/index.js`;
                await fs.promises.writeFile(index, tplFn);
                console.log('Initializing module...');
                await exec('npm init -y', { cwd: layer });
                console.log('Done!');
                console.log('Installing your module into node_modules...');
                await exec(`npm install file:${layer}`);
                const moduleName = layerPath.split('/');
                console.log(
                    `Done! package.json added ${
                        moduleName[moduleName.length - 1]
                    } dependency`,
                );
                console.log(
                    `\nYou can write your module code in ${index} now. Remember to export data from your module.\n`,
                );
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
