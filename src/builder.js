const { generatePostCss } = require("./postcss");
const { generateRollup } = require("./rollup");

/**
 * Execute all available build actions: postcss, rollup, etc.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 */
const processAll = (options) => {
    let configsToBuild = [];

    if (options.hasOwnProperty('postcss')) {
        configsToBuild.push(generatePostCss(options.postcss));
    }

    if (options.hasOwnProperty('rollup')) {
        configsToBuild.push(generateRollup(options.rollup));
    }

    return Promise.all(configsToBuild);
}

module.exports = {
    processAll
}