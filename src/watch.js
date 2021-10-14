const minimatch = require("minimatch");

const buildTypes = ['rollup', 'postcss'];

const getAllGlobs = (options) =>
    buildTypes.flatMap(buildType => 
        options[buildType].flatMap(buildConfig => 
            buildConfig.watch
        )
    ).filter((value, index, collection) => 
        collection.indexOf(value) === index
    );

const processChangedFilesFor = (configSet, changedFiles, callback) => {
    let configsWithChanges = configSet.filter(config => 
        changedFiles.some(file => 
            config.watch.some(watch => 
                minimatch(file.replace(/^\.\//, ''), watch)
            )
        )
    );

    if (configsWithChanges.length) {
        callback(configsWithChanges);
    }
}

module.exports = {
    getAllGlobs,
    processChangedFilesFor
}