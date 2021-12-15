const htmlmin = require('html-minifier');

const minifyHTML = (html) => {
  let processedHTML = html;

  if (!this.outputPath || this.outputPath.endsWith('.html')) {
    processedHTML = htmlmin.minify(processedHTML, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });
  }

  return processedHTML;
};

module.exports = {
  minifyHTML,
};
