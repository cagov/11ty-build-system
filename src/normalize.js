/**
 * Ensures the supplied configs can be processed by the rest of the code, which expects arrays of configs.
 * @param {Object|Array} config 
 * @returns {Array}
 */
const configSet = (config) => {
    return Array.isArray(config) ? config : [config];
}

module.exports = {
    configSet
}