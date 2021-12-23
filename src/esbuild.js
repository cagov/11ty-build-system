const esbuild = require('esbuild');
const chalk = require('chalk');
const normalize = require('./normalize.js');
const log = require('./log.js');

/**
 * @typedef EsbuildConfig
 * @property {string[]} [watch]
 * A list of filepath globs to check for changes during watch modes.
 * @property {import("esbuild").BuildOptions} options
 * A filepath reference to the postcss.config.js file.
 */

/**
 * Generate all Esbuild configurations.
 * @param {EsbuildConfig|EsbuildConfig[]} esbuildConfig
 * @returns {Promise}
 */
const generateEsbuild = (esbuildConfig) => {
  const configSets = normalize.configSet(esbuildConfig);

  return Promise.all(configSets.map(config => esbuild.build(config.options)
    .then(() => {
      config.options.entryPoints.forEach((entry) => {
        log(`Writing ${config.options.outfile} from ${entry} ${chalk.yellow('(esbuild)')}`);
      });
    })
    .catch(() => process.exit(1))));
};

module.exports = {
  generateEsbuild,
};
