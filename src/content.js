const minimatch = require('minimatch');
const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const log = require('./log.js');

const copyOne = (sourceFile, targetDir) => {
  const filename = path.basename(sourceFile);
  const destination = `${targetDir}/${filename}`;
  return fs.copyFile(sourceFile, destination).then(() => {
    log(`Linking ${destination} from ${sourceFile} ${chalk.cyan('(content)')}`);
  });
};

const deleteOne = (sourceFile, targetDir) => {
  const filename = path.basename(sourceFile);
  const destination = `${targetDir}/${filename}`;
  return fs.unlink(destination).then(() => {
    log(`Unlinking ${destination} from ${sourceFile} ${chalk.cyan('(content)')}`);
  });
};

const copyAll = (contentConfig) => {
  const filesToCopy = Object.entries(contentConfig).map(([sourceGlob, targetDir]) => {
    fs.mkdir(targetDir).catch((err) => {
      if (!err.code === 'EEXIST') {
        console.log(err);
      }
    });

    const sourceFiles = glob.sync(sourceGlob, { nodir: true });

    return Promise.all(sourceFiles.map(file => copyOne(file, targetDir)));
  });

  return Promise.all(filesToCopy);
};

const copyOnWatch = (filePath, contentConfig) => {
  const targets = Object.keys(contentConfig).filter(key => minimatch(filePath, key));

  return Promise.all(targets.map(target => copyOne(filePath, contentConfig[target])));
};

const deleteOnWatch = (filePath, contentConfig) => {
  const targets = Object.keys(contentConfig).filter(key => minimatch(filePath, key));

  return Promise.all(targets.map(target => deleteOne(filePath, contentConfig[target])));
};

module.exports = {
  copyOne,
  copyAll,
  copyOnWatch,
  deleteOnWatch,
};
