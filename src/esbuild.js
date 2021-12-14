const esbuild = require('esbuild');
const chalk = require('chalk');
const normalize = require('./normalize.js');
const log = require('./log.js');

const generateEsbuild = (esbuildConfig) => {
  const configSets = normalize.configSet(esbuildConfig);

  return Promise.all(configSets.map(config => esbuild.build(config)
    .then(() => {
      log(`Writing ${config.outfile} from ${config.entryPoints[0]} ${chalk.yellow('(esbuild)')}`);
    })
    .catch(() => process.exit(1))));
};

module.exports = {
  generateEsbuild,
};
