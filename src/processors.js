const { generatePostCss } = require('./postcss.js');
const { generateRollup } = require('./rollup.js');
const { generateSass } = require('./sass.js');
const { generateEsbuild } = require('./esbuild.js');

module.exports = {
  postcss: generatePostCss,
  rollup: generateRollup,
  sass: generateSass,
  esbuild: generateEsbuild,
};
