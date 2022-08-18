const shortcodes = require('./src/shortcodes.js');
const filters = require('./src/filters.js');
const watcher = require('./src/watcher.js');
const builder = require('./src/builder.js');
const log = require('./src/log.js');
const transforms = require('./src/transforms.js');

let firstBuild = true;
let watching = false;

/**
 * @typedef BuildSystemConfig
 * @property {ProcessorConfig} [processors]
 * A collection of asset processor configurations: sass, esbuild, etc.
 * @property {beforeBuild} [beforeBuild]
 * Callback function to run arbitrary code within the build.
 }}
 */

/**
 * @typedef ProcessorsConfig
 * @property {import("./src/postcss").PostcssConfig} [postcss]
 * Build options for Postcss.
 * @property {import("./src/rollup").RollupConfig} [rollup]
 * Build options for Rollup.
 * @property {import("./src/sass").SassConfig} [sass]
 * Build options for Postcss.
 * @property {import("./src/esbuild").EsbuildConfig} [esbuild]
 * Build options for Rollup.
 }}
 */

/**
 * This generic callback function provides a way to run arbitrary code within the build system.
 * @callback beforeBuild
 */

/**
 * Inject @cagov's build system into your 11ty site's .eleventy.js config file.
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * Eleventy's config object.
 * @param {BuildSystemConfig} buildSystemConfig
 * Build system configuration.
 */
const eleventyBuildSystem = (eleventyConfig, buildSystemConfig = {}) => {
  eleventyConfig.setBrowserSyncConfig({
    notify: true,
  });

  // Add shortcodes.
  eleventyConfig.addPairedShortcode('includecss', shortcodes.includeCSS);
  eleventyConfig.addPairedShortcode('includejs', shortcodes.includeJS);

  // Add filters.
  eleventyConfig.addFilter('changeDomain', filters.changeDomain);

  // Add transforms.
  eleventyConfig.addTransform('htmlMinifier', transforms.minifyHTML);
  // Need to make image conversion toggle-able.
  eleventyConfig.addTransform('convertImg', transforms.convertImg);

  // Add all watch configs into 11ty.
  if (buildSystemConfig?.processors) {
    watcher.getAllGlobs(buildSystemConfig.processors)
      .forEach(watch => eleventyConfig.addWatchTarget(watch));
  }

  // Build assets per provided configs.
  eleventyConfig.on('beforeBuild', async () => {
    if (process.env.NODE_ENV === 'development') {
      log('Note: Building site in dev mode.');
    }

    if (typeof buildSystemConfig.beforeBuild === 'function') {
      buildSystemConfig.beforeBuild();
    }

    if (firstBuild || !watching) {
      if (buildSystemConfig?.processors) {
        await builder.processAll(buildSystemConfig?.processors);
      }

      firstBuild = false;
    }
  });

  // Set up watch processes per config.
  eleventyConfig.on('beforeWatch', async (changedFiles) => {
    watching = true;
    if (buildSystemConfig?.processors) {
      await watcher.processChanges(buildSystemConfig.processors, changedFiles);
    }
  });
};

module.exports = eleventyBuildSystem;
