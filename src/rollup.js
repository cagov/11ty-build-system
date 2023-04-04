const path = require('path');
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile.js');
const chalk = require('chalk');
const normalize = require('./normalize.js');
const log = require('./log.js');

/**
 * @typedef RollupConfig
 * @property {string[]} [watch] A list of filepath globs to check for changes during watch modes.
 * @property {string} file A filepath reference to the rollup.config.js file.
 */

/**
 * Generate all rollups.
 * @param {RollupConfig|RollupConfig[]} rollupConfig
 * @returns {Promise}
 */
const generateRollup = (rollupConfig) => {
  const configSets = normalize.configSet(rollupConfig);

  return Promise.all(configSets.map((config) => {
    const configFilePath = path.resolve(process.cwd(), config.file);

    // Lifted from https://rollupjs.org/guide/en/#programmatically-loading-a-config-file
    return loadConfigFile(configFilePath)
      .then(async ({ options, warnings }) => {
        warnings.flush();

        const bundles = [];

        for (const optionsObj of options) {
          const rollupOutput = rollup.rollup(optionsObj)
            .then(bundle => Promise.all(optionsObj.output.map((output) => {
              log(`Writing ${output.file} from ${config.file} ${chalk.green('(rollup)')}`);
              return bundle.write(output);
            })));

          bundles.push(rollupOutput);
        }

        return Promise.all(bundles);
      });
  }));
};

module.exports = {
  generateRollup,
};
