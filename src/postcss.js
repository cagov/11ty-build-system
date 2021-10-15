const fs = require("fs").promises;
const path = require('path');
const postcss = require('postcss');
const normalize = require('./normalize');
const log = require("./log");
const chalk = require("chalk");

/**
 * @typedef PostcssConfig
 * @property {string[]} watch A list of filepath globs to check for changes during live development/watch modes.
 * @property {string} file A filepath reference to the postcss.config.js file.
 */

/**
 * 
 * @param {PostcssConfig|PostcssConfig[]} postcssConfig  
 * @returns {Promise}
 */
const generatePostCss = postcssConfig => {
    let configSets = normalize.configSet(postcssConfig);

    return Promise.all(configSets.map(config => {
        const { plugins, ...options } = require(path.resolve(process.cwd(), config.file));

        return fs.readFile(options.from).then(css => 
            postcss(plugins).process(css, options).then(async result => {
                let filesToWrite = [];

                log(`Writing ${options.to} from ${options.from} ${chalk.cyan('(postcss)')}`);
                filesToWrite.push(fs.writeFile(options.to, result.css, () => true));

                if ( result.map ) {
                    let sourceMapPath = options.to.replace(/\.css/gi, ".map.css");
                    log(`Writing ${sourceMapPath} from ${options.to} ${chalk.cyan('(postcss)')}`);
                    filesToWrite.push(fs.writeFile(sourceMapPath, result.map.toString(), () => true));
                }

                await Promise.all(filesToWrite);
            })
        );
    }));
};

module.exports = {
    generatePostCss
}