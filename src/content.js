const glob = require('glob');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const log = require('./log.js');

const link = (symlinkConfig) => {
  for (const [sourceGlob, targetDir] of Object.entries(symlinkConfig)) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    const sourceFiles = glob.sync(sourceGlob, { nodir: true });

    sourceFiles.forEach((file) => {
      const filename = path.basename(file);
      const destination = `${targetDir}/${filename}`;
      fs.copyFileSync(file, destination);
      log(`Linking ${destination} from ${file} ${chalk.cyan('(content)')}`);
    });
  }
};

const unlink = (symlinkConfig) => {
  for (const [sourceGlob, targetDir] of Object.entries(symlinkConfig)) {
    const sourceFiles = glob.sync(sourceGlob, { nodir: true });

    sourceFiles.forEach((file) => {
      const filename = path.basename(file);
      const destination = `${targetDir}/${filename}`;
      fs.unlinkSync(destination);
      log(`Unlinking ${destination} ${chalk.cyan('(symlink)')}`);
    });

    if (fs.readdirSync(targetDir).length === 0) {
      fs.rmdirSync(targetDir);
    }
  }
};

module.exports = {
  link,
  unlink,
};
