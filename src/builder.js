const chalk = require('chalk');
const processors = require('./processors.js');
const log = require('./log.js');

/**
 * Execute all available build actions: postcss, rollup, etc.
 * @param {import("../index").ProcessorsConfig} processorsConfig
 * Options provided to this 11ty plugin.
 */
const processAll = (processorsConfig) => {
  const configsToBuild = Object.entries(processorsConfig)
    .reduce((bucket, [processorType, configuration]) => {
      if (processors[processorType]) {
        bucket.push(processors[processorType](configuration));
      } else {
        log(chalk.yellow(`${chalk.bold(processorType)} configuration not recognized.`));
        log(chalk.yellow(`Available options: ${Object.keys(processors).join(', ')}.`));
        log(chalk.yellow('Check your @cagov/11ty-build-system plugin settings in your .eleventy.js file.'));
      }
      return bucket;
    }, []);

  return Promise.all(configsToBuild);
};

module.exports = {
  processAll,
};
