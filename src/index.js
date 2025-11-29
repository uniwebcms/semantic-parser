const { processSequence } = require('./processors/sequence');
const { processGroups } = require('./processors/groups');
const { processByType } = require('./processors/byType');
const mappers = require('./mappers');

/**
 * Parse ProseMirror/TipTap content into semantic structure
 * @param {Object} doc - ProseMirror document
 * @param {Object} options - Parsing options
 * @param {number} options.pretitleLevel - Heading level for pretitle (2 for H2, 3 for H3). Default: 3
 * @param {boolean} options.parseCodeAsJson - Parse code blocks as JSON. Default: false
 * @param {boolean} options.extractBodyHeadings - Extract headings from body section. Default: false
 * @returns {Object} Parsed content structure
 */
function parseContent(doc, options = {}) {
    // Default options
    const opts = {
        pretitleLevel: 3,
        parseCodeAsJson: false,
        extractBodyHeadings: false,
        ...options
    };

    // Process content in different ways
    const sequence = processSequence(doc, opts);
    const groups = processGroups(sequence, opts);
    const byType = processByType(sequence);

    return {
        raw: doc,
        sequence,
        groups,
        byType
    };
}

module.exports = {
    parseContent,
    mappers
};
