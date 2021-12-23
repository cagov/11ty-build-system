/**
 * Ensures the supplied configs can be processed by the rest of the code.
 * All build processors expect an arrays of configs.
 * @template T
 * @param {T|T[]} config
 * @returns {T[]}
 */
const configSet = config => (Array.isArray(config) ? config : [config]);

module.exports = {
  configSet,
};
