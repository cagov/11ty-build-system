const { generatePostCss } = require('./postcss.js');
const { generateRollup } = require('./rollup.js');
const { generateSass } = require('./sass.js');

/**
 * Execute all available build actions: postcss, rollup, etc.
 * @param {import("../index").BuildSystemOptions} options Options provided to this 11ty plugin.
 */
const processAll = (options) => {
  const configsToBuild = [];

  if ('postcss' in options) {
    configsToBuild.push(generatePostCss(options.postcss));
  }

  if ('rollup' in options) {
    configsToBuild.push(generateRollup(options.rollup));
  }

  if ('sass' in options) {
    configsToBuild.push(generateSass(options.sass));
  }

  return Promise.all(configsToBuild);
};

module.exports = {
  processAll,
};
