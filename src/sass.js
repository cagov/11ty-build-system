const fs = require('fs').promises;
const { promisify } = require('util');
const sass = require('sass');
const CleanCSS = require('clean-css');

const sassRender = promisify(sass.render);
const chalk = require('chalk');
const normalize = require('./normalize.js');
const log = require('./log.js');
const { generatePostCss } = require('./postcss.js');

/**
 * @typedef SassConfig
 * @property {string[]} [watch]
 * A list of filepath globs to check for changes during watch modes.
 * @property {string} output
 * A destination filepath for the output file.
 * @property {import("@types/sass").Options} options
 * Dart-Sass processing options.
 * See https://sass-lang.com/documentation/js-api/interfaces/LegacyFileOptions
 * @property {string} options.file
 * Filepath to the Sass source file.
 * @property {import("./postcss").PostcssConfig} postcss
 * PostCSS config to post-process Sass output.
 */

/**
 * Generate all Sass.
 * @param {SassConfig|SassConfig[]} sassConfig
 * @returns {Promise}
 */
const generateSass = (sassConfig) => {
  const configSets = normalize.configSet(sassConfig);

  return Promise.all(configSets.map(config => sassRender(config.options)
    .then(async (result) => {
      const filesToWrite = [];

      log(`Writing ${config.output} from ${config.options.file} ${chalk.magenta('(sass)')}`);

      let outputCSS;

      if (config.minify) {
        outputCSS = new CleanCSS({}).minify(result.css).styles;
      } else {
        outputCSS = result.css;
      }

      filesToWrite.push(fs.writeFile(config.output, outputCSS));

      if (config.options.sourceMap) {
        const sourceMapOutputPath = config.output.replace(/\.css/gi, '.map.css');
        log(`Writing ${sourceMapOutputPath} from ${config.options.file} ${chalk.magenta('(sass)')}`);
        filesToWrite.push(fs.writeFile(sourceMapOutputPath, result.map));
      }

      if ('postcss' in config) {
        await Promise.all(filesToWrite);
        const postCssConfigSets = normalize.configSet(config.postcss);
        return generatePostCss(postCssConfigSets);
      }
      return Promise.all(filesToWrite);
    })));
};

module.exports = {
  generateSass,
};
