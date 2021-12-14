const minimatch = require('minimatch');
const normalize = require('./normalize.js');
const { generatePostCss } = require('./postcss.js');
const { generateRollup } = require('./rollup.js');
const { generateSass } = require('./sass.js');

/**
 * An array of build tools processed by this 11ty plugin.
 */
const buildTypes = ['rollup', 'postcss', 'sass'];

/**
 * Finds all glob expressions within the options provided to this 11ty plugin.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 * @returns {string[]} An array of unique glob expressions.
 */
const getAllGlobs = options => buildTypes
  .filter(buildType => buildType in options)
  .flatMap((buildType) => {
    const configSet = normalize.configSet(options[buildType]);
    return configSet.flatMap(buildConfig => buildConfig.watch);
  })
  .filter((value, index, collection) => collection.indexOf(value) === index);

/**
 * This callback executes PostCSS or Rollup processing.
 * @callback beforeWatchCallback
 * @param {import("./postcss").PostcssConfig|import("./rollup").RollupConfig} options
 */

/**
 * Conditionally executes the callback only if a config's watched files have changed.
 * For use with 11ty's serve mode.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 * @param {string[]} changedFiles A list of changed files as supplied by 11ty's beforeWatch event.
 * @param {beforeWatchCallback} callback
 */
const processChangedFilesFor = (options, changedFiles, callback) => {
  const configSet = normalize.configSet(options);

  const configsWithChanges = configSet.filter(config => changedFiles.some(file => config?.watch?.some(watch => minimatch(file.replace(/^\.\//, ''), watch))));

  if (configsWithChanges.length) {
    return callback(configsWithChanges);
  }
  return null;
};

/**
 * Execute build actions based on changes to watched files.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 * @param {string[]} changedFiles A list of changed files as supplied by 11ty's beforeWatch event.
 */
const processChanges = (options, changedFiles) => {
  const configSetsToProcess = [];

  if ('sass' in options) {
    const sassChanges = processChangedFilesFor(options.sass, changedFiles, generateSass);
    if (sassChanges) {
      configSetsToProcess.push(sassChanges);
    }
  }

  if ('rollup' in options) {
    const rollupChanges = processChangedFilesFor(options.rollup, changedFiles, generateRollup);
    if (rollupChanges) {
      configSetsToProcess.push(rollupChanges);
    }
  }

  if ('postcss' in options) {
    const postcssChanges = processChangedFilesFor(options.postcss, changedFiles, generatePostCss);
    if (postcssChanges) {
      configSetsToProcess.push(postcssChanges);
    }
  }

  return Promise.all(configSetsToProcess);
};

module.exports = {
  buildTypes,
  getAllGlobs,
  processChangedFilesFor,
  processChanges,
};
