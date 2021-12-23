const minimatch = require('minimatch');
const normalize = require('./normalize.js');
const processors = require('./processors.js');

/**
 * Finds all glob expressions within the options provided to this 11ty plugin.
 * @param {import("../index").ProcessorsConfig} processorsConfig
 * Options provided to this 11ty plugin.
 * @returns {string[]}
 * An array of unique glob expressions.
 */
const getAllGlobs = (processorsConfig = {}) => {
  const globs = Object.keys(processors)
    .filter(processorType => processorType in processorsConfig)
    .flatMap((processorType) => {
      const configSet = normalize.configSet(processorsConfig[processorType]);
      return configSet.flatMap(buildConfig => buildConfig.watch);
    })
    .filter((value, index, collection) => collection.indexOf(value) === index);

  return globs;
};

/**
 * This callback executes processing.
 * @name beforeWatchCallback
 * @template T
 * @function
 * @param {T} processorConfig
 */

/**
 * Conditionally executes the callback only if a config's watched files have changed.
 * For use with 11ty's serve mode.
 * @template T
 * @param {T} processorConfig
 * Options provided to this 11ty plugin.
 * @param {string[]} changedFiles
 * A list of changed files as supplied by 11ty's beforeWatch event.
 * @param {beforeWatchCallback} callback
 */
const processChangedFilesFor = (processorConfig, changedFiles, callback) => {
  const configSet = normalize.configSet(processorConfig);

  // Find any processor configurations for which the files have changed.
  const configsWithChanges = configSet.filter(config => changedFiles.some(file => config?.watch?.some(watch => minimatch(file.replace(/^\.\//, ''), watch))));

  // If there are changed files, execute the given processor.
  if (configsWithChanges.length) {
    return callback(configsWithChanges);
  }
  return null;
};

/**
 * Execute build actions based on changes to watched files.
 * @param {import("../index").ProcessorsConfig} processorsConfig
 * Options provided to this 11ty plugin.
 * @param {string[]} changedFiles
 * A list of changed files as supplied by 11ty's beforeWatch event.
 */
const processChanges = (processorsConfig, changedFiles) => {
  // Iterate over the given processor configs supplied to the plugin (sass, esbuild, etc.).
  const configSetsToProcess = Object.entries(processorsConfig)
    .reduce((bucket, [processorType, configuration]) => {
      if (processors[processorType]) {
        // Check to see if any of this processor's watched files have changed.
        // If so, execute the build action against the processor with changed files.
        const changes = processChangedFilesFor(
          configuration,
          changedFiles,
          processors[processorType],
        );

        // If the build action has been initiated, push it into the Promise bucket.
        if (changes) {
          bucket.push(changes);
        }
      }

      return bucket;
    }, []);

  return Promise.all(configSetsToProcess);
};

module.exports = {
  getAllGlobs,
  processChangedFilesFor,
  processChanges,
};
