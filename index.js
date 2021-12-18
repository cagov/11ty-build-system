const chokidar = require('chokidar');
const shortcodes = require('./src/shortcodes.js');
const filters = require('./src/filters.js');
const watcher = require('./src/watcher.js');
const builder = require('./src/builder.js');
const log = require('./src/log.js');
const nunjucks = require('./src/nunjucks.js');
const transforms = require('./src/transforms.js');
const content = require('./src/content.js');

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
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setWatchThrottleWaitTime(100);

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

  // Add all watch configs into 11ty.
  watcher.getAllGlobs(options).forEach(watch => eleventyConfig.addWatchTarget(watch));

  if (options?.dir?.includes) {
    eleventyConfig.setLibrary('njk', nunjucks.environment);

    nunjucks.forEachMissingLayout((layout) => {
      eleventyConfig.addLayoutAlias(layout.file, layout.path);
      eleventyConfig.addLayoutAlias(layout.slug, layout.path);
    });
  }

  eleventyConfig.addPassthroughCopy({
    'node_modules/@cagov/11ty-build-system/defaults/css/fonts': 'fonts',
  });

  // Build assets per provided configs.
  eleventyConfig.on('beforeBuild', async () => {
    if (process.env.NODE_ENV === 'development') {
      log('Note: Building site in dev mode.');
    }

    if (options?.dir?.includes) {
      nunjucks.addMissingTemplateFolders();
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
  });

  // Set up watch processes per config.
  eleventyConfig.on('beforeWatch', async (changedFiles) => {
    if ('extraContent' in options && !watching) {
      chokidar.watch(Object.keys(options.extraContent), {
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      })
        .on('add', path => content.copyOnWatch(path, options.extraContent))
        .on('change', path => content.copyOnWatch(path, options.extraContent))
        .on('unlink', path => content.deleteOnWatch(path, options.extraContent));
    }

    watching = true;
    await watcher.processChanges(options, changedFiles);
  });
};

module.exports = eleventyBuildSystem;
