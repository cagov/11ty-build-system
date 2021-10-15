const chalk = require('chalk');

/**
 * Consistently log messages to console.
 * @param {string} message The message to log. 
 */
const log = message => {
    console.log(`${chalk.blue('[CaGov Build System]')} ${message}`);
}

module.exports = log;