const shortcodes = require('./src/shortcodes.js');
const watcher = require('./src/watcher.js');
const builder = require('./src/builder.js');
const log = require('./src/log.js');
const nunjucks = require('./src/nunjucks.js');

let firstBuild = true;
let watching = false;

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
  eleventyConfig.setLibrary('njk', nunjucks.environment);

  // Add in all shortcodes.
  eleventyConfig.addPairedShortcode('includecss', shortcodes.includeCSSUnlessDev);
  eleventyConfig.addPairedShortcode('includejs', shortcodes.includeJSUnlessDev);

  // Add all watch configs into 11ty.
  watcher.getAllGlobs(options).forEach(watch => eleventyConfig.addWatchTarget(watch));

  nunjucks.forEachMissingLayout((layout) => {
    eleventyConfig.addLayoutAlias(layout.file, layout.path);
    eleventyConfig.addLayoutAlias(layout.slug, layout.path);
  });

  eleventyConfig.addPassthroughCopy({
    'node_modules/@cagov/11ty-build-system/defaults/css/fonts': 'fonts',
  });

  // Build assets per provided configs.
  eleventyConfig.on('beforeBuild', async () => {
    nunjucks.addMissingTemplateFolders();

    if (process.env.NODE_ENV === 'development') {
      log('Note: Building site in dev mode.');
    }

    if (typeof options.beforeBuild === 'function') {
      options.beforeBuild();
    }

    if (firstBuild || !watching) {
      await builder.processAll(options);
      firstBuild = false;
    }
  });

  eleventyConfig.on('afterBuild', async () => {
    nunjucks.removeEmptyTemplateFolders();
  });

  // Set up watch processes per config.
  eleventyConfig.on('beforeWatch', async (changedFiles) => {
    watching = true;
    await watcher.processChanges(options, changedFiles);
  });
};

module.exports = eleventyBuildSystem;
