/**
 * Content mapping utilities for transforming parsed content
 * into component-specific formats
 */

const helpers = require('./helpers');
const accessor = require('./accessor');
const extractors = require('./extractors');

module.exports = {
    // Helper utilities
    helpers,

    // Path-based accessor
    accessor,

    // Common extractors
    extractors,

    // Convenience exports for direct access
    ...helpers,
    ...accessor,
    ...extractors
};
