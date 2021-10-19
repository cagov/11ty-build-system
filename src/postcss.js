/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs').promises;
const path = require('path');
const postcss = require('postcss');
const chalk = require('chalk');
const normalize = require('./normalize.js');
const log = require('./log.js');

/**
 * @typedef PostcssConfig
 * @property {string[]} [watch] A list of filepath globs to check for changes during watch modes.
 * @property {string} file A filepath reference to the postcss.config.js file.
 */

/**
 * Generate all PostCSS configurations.
 * @param {PostcssConfig|PostcssConfig[]} postcssConfig
 * @returns {Promise}
 */
const generatePostCss = (postcssConfig) => {
  const configSets = normalize.configSet(postcssConfig);

  return Promise.all(configSets.map((config) => {
    const { plugins, ...options } = require(path.resolve(process.cwd(), config.file));

    return fs.readFile(options.from)
      .then(css => postcss(plugins).process(css, options).then(async (result) => {
        const filesToWrite = [];

        log(`Writing ${options.to} from ${options.from} ${chalk.cyan('(postcss)')}`);
        filesToWrite.push(fs.writeFile(options.to, result.css, () => true));

        if (result.map) {
          const sourceMapPath = options.to.replace(/\.css/gi, '.map.css');
          log(`Writing ${sourceMapPath} from ${options.to} ${chalk.cyan('(postcss)')}`);
          filesToWrite.push(fs.writeFile(sourceMapPath, result.map.toString(), () => true));
        }

        await Promise.all(filesToWrite);
      }));
  }));
};

/**
 * Default safelist and extractors for using PurgeCSS with PostCSS.
 */
const purgeCssDefaults = {
  safelist: {
    deep: [/lang$/, /dir$/],
  },
  extractors: [
    {
      extractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      extensions: ['js'],
    },
  ],
};

module.exports = {
  generatePostCss,
  purgeCssDefaults,
};
