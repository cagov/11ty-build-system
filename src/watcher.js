const minimatch = require("minimatch");
const normalize = require('./normalize');
const { generatePostCss } = require("./postcss");
const { generateRollup } = require("./rollup");

/**
 * An array of build tools processed by this 11ty plugin.
 */
const buildTypes = ['rollup', 'postcss'];

/**
 * Finds all glob expressions within the options provided to this 11ty plugin.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 * @returns {string[]} An array of unique glob expressions.
 */
const getAllGlobs = (options) =>
    buildTypes.flatMap(buildType => {
        let configSet = normalize.configSet(options[buildType]);

        return configSet.flatMap(buildConfig => 
            buildConfig.watch
        )
    }).filter((value, index, collection) => 
        collection.indexOf(value) === index
    );

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
    let configSet = normalize.configSet(options);

    let configsWithChanges = configSet.filter(config => 
        changedFiles.some(file => 
            config.watch.some(watch => 
                minimatch(file.replace(/^\.\//, ''), watch)
            )
        )
    );

    if (configsWithChanges.length) {
        return callback(configsWithChanges);
    } else {
        return null;
    }
}

/**
 * Execute build actions based on changes to watched files.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 * @param {string[]} changedFiles A list of changed files as supplied by 11ty's beforeWatch event.
 */
const processChanges = (options, changedFiles) => {
    let configSetsToProcess = [];

    if (options.hasOwnProperty('postcss')) {
        let postcssChanges = processChangedFilesFor(options.postcss, changedFiles, generatePostCss);
        if (postcssChanges) {
            configSetsToProcess.push(postcssChanges);
        }
    }

    if (options.hasOwnProperty('rollup')) {
        let rollupChanges = processChangedFilesFor(options.rollup, changedFiles, generateRollup);
        if (rollupChanges) {
            configSetsToProcess.push(rollupChanges);
        }
    }

    return Promise.all(configSetsToProcess);
}

module.exports = {
    buildTypes,
    getAllGlobs,
    processChangedFilesFor,
    processChanges
}