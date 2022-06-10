const htmlmin = require('html-minifier');

const minifyHTML = (html, outputPath) => {
  let processedHTML = html;

  if (!outputPath || outputPath.endsWith('.html')) {
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
