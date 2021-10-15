const minimatch = require("minimatch");
const normalize = require('./normalize');

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
        callback(configsWithChanges);
    }
}

module.exports = {
    buildTypes,
    getAllGlobs,
    processChangedFilesFor
}