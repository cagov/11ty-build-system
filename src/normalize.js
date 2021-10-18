/**
 * Ensures the supplied configs can be processed by the rest of the code.
 * All build processors expect an arrays of configs.
 * @param {Object|Array} config
 * @returns {Array}
 */
const configSet = config => (Array.isArray(config) ? config : [config]);

module.exports = {
  configSet,
};
