const { processSequence } = require("./processors/sequence");
const { processGroups } = require("./processors/groups");
const { processByType } = require("./processors/byType");

/**
 * Parse ProseMirror/TipTap content into semantic structure
 * @param {Object} doc - ProseMirror document
 * @returns {Object} Parsed content structure
 */
function parseContent(doc) {
  // Process content in different ways
  const sequence = processSequence(doc);
  const groups = processGroups(sequence);
  const byType = processByType(sequence);

  return {
    raw: doc,
    sequence,
    groups,
    byType,
  };
}

module.exports = {
  parseContent,
};
