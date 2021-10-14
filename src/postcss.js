const fs = require("fs").promises;
const path = require('path');
const postcss = require('postcss');

const generatePostCss = postcssConfigs => {
    return Promise.all(postcssConfigs.map(postcssConfig => {
        const { plugins, ...options } = require(path.resolve(process.cwd(), postcssConfig.file));

        return fs.readFile(options.from).then(css => 
            postcss(plugins).process(css, options).then(async result => {
                let filesToWrite = [];

                console.log(`[CaGov Build System] Writing ${options.to} from ${options.from} (postcss)`);
                filesToWrite.push(fs.writeFile(options.to, result.css, () => true));

                if ( result.map ) {
                    let sourceMapPath = options.to.replace(/\.css/gi, ".map.css");
                    console.log(`[CaGov Build System] Writing ${sourceMapPath} from ${options.to} (postcss)`);
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