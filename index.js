const shortcodes = require("./src/shortcodes");
const { generatePostCss } = require("./src/postcss");
const { generateRollup } = require("./src/rollup");
const watch = require("./src/watch");

let firstBuild = true;
let dev = process.env.NODE_ENV === 'development';

/**
 * 
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * 
 */
const eleventyBuildSystem = (eleventyConfig, options = {}) => {
    // Add in all shortcodes.
    eleventyConfig.addPairedShortcode("includecss", shortcodes.includeCSSUnlessDev);
    eleventyConfig.addPairedShortcode("includejs", shortcodes.includeJSUnlessDev);

    // Add all watch configs into 11ty.
    watch.getAllGlobs(options).forEach(watch => eleventyConfig.addWatchTarget(watch));

    // Build assets per config.
    eleventyConfig.on('beforeBuild', async () => {
        if (dev) {
            console.log('[CaGov Build System] Note: Building site in dev mode.');
        }

        if (typeof options.beforeBuild === Function) {
            options.beforeBuild();
        }

        if (dev || firstBuild) {
            await Promise.all([
                generatePostCss(options.postcss),
                generateRollup(options.rollup)
            ]);

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