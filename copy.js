const util = require('util');
const ncp = util.promisify(require('ncp').ncp);
const fs = require('fs');

const srcPath = 'node_modules';
const layerPath = 'layer/nodejs/node_modules';

(async function () {
    try {
        if (fs.existsSync('layer')) {
            console.log('Removing existing layers...');
            await fs.promises.rm('layer', { recursive: true });
            console.log('Done!');
        }
        await fs.promises.mkdir('layer/nodejs', { recursive: true });
        console.log(`Coping node_modules from ${srcPath} into ${layerPath}...`);
        await ncp(srcPath, layerPath, {
            clobber: true,
            dereference: true,
            stopOnErr: true,
        });
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
})();
