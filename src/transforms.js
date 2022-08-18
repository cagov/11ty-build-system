const htmlmin = require('html-minifier');
const cheerio = require('cheerio');
const Image = require('@11ty/eleventy-img');
const path = require('path');

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

const convertImg = (html, outputPath) => {
  const result = html;

  // Need to make these options configurable, in whole or in part.
  const options = {
    widths: [512, 768, 1200, null],
    sizes: '(min-width: 512px) 512px, (min-width: 768px) 768px, (min-width: 1200px) 1200px, 100vw',
    formats: ['webp'],
    urlPath: '/img/',
    outputDir: './docs/img/',
    filenameFormat: (id, src, width, format) => {
      const extension = path.extname(src);
      const filename = path.basename(src, extension);
      return `${filename}-${width}w.${format}`;
    },
  };

  if (outputPath && outputPath.endsWith('.html')) {
    const $ = cheerio.load(html, null);

    $('img').each(async (i, el) => {
      if ($(el).parent()[0].name !== 'picture') {
        const src = $(el).attr('src');
        let imageInputPath;

        // Need to make these paths configurable.
        if (src.startsWith('/assets')) {
          imageInputPath = `./src/assets/${src.replace(/^\/assets\//, '')}`;
        }
        if (src.startsWith('/media')) {
          imageInputPath = `./src/wordpress-media/${src.replace(/^\/media\//, '')}`;
        }

        if (imageInputPath) {
          const data = Image.statsSync(imageInputPath, options);
          const largest = data.webp.slice(-1)[0];

          if (largest.width > 512) {
            // Generate image set.
            // Needs to handle missing images.
            Image(imageInputPath, options);

            // Need to actually do something with this mark-up.
            const imgMarkup = Image.generateHTML(data, {
              alt: '',
              sizes: options.sizes,
              loading: 'lazy',
            });
          }
        }
      }
    });
  }

  return result;
};

module.exports = {
  minifyHTML,
  convertImg,
};
