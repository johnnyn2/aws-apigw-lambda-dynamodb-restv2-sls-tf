const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

const layerPath = 'layer/nodejs/';
const srcPath = 'src/';
const folderPath = ['dao/', 'service/', 'util/'];

async function packCommonModules() {
    let directories = [];
    for (const folder of folderPath) {
        const dir = await fs.promises.readdir(srcPath + folder);
        directories = [...directories, ...dir.map((d) => srcPath + folder + d)];
    }
    const packs = directories.map((cwd) => {
        return {
            cwd,
            pack: async () => await exec('npm pack', { cwd }),
        };
    });
    for (const obj of packs) {
        const { cwd, pack } = obj;
        console.log(`Packaging ${cwd}...`);
        await pack();
    }
}

function installCommonModules() {
    console.log(
        `Installing common lambda layers into ${layerPath}node_modules`,
    );
    // eslint-disable-next-line no-unused-vars
    exec('npm install', { cwd: layerPath }, (err, stdout, stderr) => {
        console.log(stdout);
    });
}

(async function () {
    await packCommonModules();
    installCommonModules();
})();
