const path = require('path');
const rollup = require("rollup");
const loadConfigFile = require('rollup/dist/loadConfigFile');

const generateRollup = rollupConfigs => {
    return Promise.all(rollupConfigs.map(rollupConfig => {
        // Lifted from https://rollupjs.org/guide/en/#programmatically-loading-a-config-file
        return loadConfigFile(path.resolve(process.cwd(), rollupConfig.file)).then(
            async ({ options, warnings }) => {
                warnings.flush();
                for (const optionsObj of options) {
                    let bundle = await rollup.rollup(optionsObj);
                    await Promise.all(optionsObj.output.map(output => {
                        console.log(`[CaGov Build System] Writing ${output.file} from ${rollupConfig.file} (rollup)`);
                        return bundle.write(output);
                    }));
                }
            }
        );
    }));
};

module.exports = {
    generateRollup
}