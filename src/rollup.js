const path = require('path');
const rollup = require("rollup");
const loadConfigFile = require('rollup/dist/loadConfigFile');
const normalize = require('./normalize');
const log = require("./log");
const chalk = require("chalk");

/**
 * @typedef RollupConfig
 * @property {string[]} watch A list of filepath globs to check for changes during live development/watch modes.
 * @property {string} file A filepath reference to the rollup.config.js file.
 */

/**
 * 
 * @param {RollupConfig|RollupConfig[]} rollupConfig  
 * @returns {Promise}
 */
const generateRollup = rollupConfig => {
    let configSets = normalize.configSet(rollupConfig);

    return Promise.all(configSets.map(config => {
        // Lifted from https://rollupjs.org/guide/en/#programmatically-loading-a-config-file
        return loadConfigFile(path.resolve(process.cwd(), config.file)).then(
            async ({ options, warnings }) => {
                warnings.flush();

                for (const optionsObj of options) {
                    let bundle = await rollup.rollup(optionsObj);
                    
                    await Promise.all(optionsObj.output.map(output => {
                        log(`Writing ${output.file} from ${config.file} ${chalk.green('(rollup)')}`);
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