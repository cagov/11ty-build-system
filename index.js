const shortcodes = require("./src/shortcodes");
const { generatePostCss } = require("./src/postcss");
const { generateRollup } = require("./src/rollup");
const watch = require("./src/watch");
const log = require("./src/log");

let firstBuild = true;
let dev = process.env.NODE_ENV === 'development';

/**
 * @typedef BuildSystemOptions
 * @property {import("./src/postcss").PostcssConfig} [postcss] Build options for Postcss.
 * @property {import("./src/rollup").RollupConfig} [rollup] Build options for Rollup.
 * @property {beforeBuild} [beforeBuild] Callback function to run arbitrary code within the build.
 }}
 */

/**
 * This generic callback function provides a way to run arbitrary code within the build system.
 * @callback beforeBuild
 */

/**
 * Inject @cagov's build system into your 11ty site's .eleventy.js config file.
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig Eleventy's config object.
 * @param {BuildSystemOptions} options Build options.
 */
const eleventyBuildSystem = (eleventyConfig, options = {}) => {
    // Add in all shortcodes.
    eleventyConfig.addPairedShortcode("includecss", shortcodes.includeCSSUnlessDev);
    eleventyConfig.addPairedShortcode("includejs", shortcodes.includeJSUnlessDev);

    // Add all watch configs into 11ty.
    watch.getAllGlobs(options).forEach(watch => eleventyConfig.addWatchTarget(watch));

    // Build assets per provided configs.
    eleventyConfig.on('beforeBuild', async () => {
        if (dev) {
            log('Note: Building site in dev mode.');
        }

        if (typeof options.beforeBuild === Function) {
            options.beforeBuild();
        }

        if (dev || firstBuild) {
            let configsToBuild = [];

            if (options.hasOwnProperty('postcss')) {
                configsToBuild.push(generatePostCss(options.postcss));
            }

            if (options.hasOwnProperty('rollup')) {
                configsToBuild.push(generateRollup(options.rollup));
            }

            await Promise.all(configsToBuild);

            firstBuild = false;
        }
    });
    
    // Set up watch processes per config.
    eleventyConfig.on('beforeWatch', async changedFiles => {
        watch.processChangedFilesFor(options.postcss, changedFiles, generatePostCss);
        watch.processChangedFilesFor(options.rollup, changedFiles, generateRollup);
    });   
}

module.exports = eleventyBuildSystem