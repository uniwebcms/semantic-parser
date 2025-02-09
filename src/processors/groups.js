const { isMainGroup, addGroupToStructure } = require("../utils/group");
const {
  shouldStartNewGroup,
  hasMultipleTopLevelHeadings,
} = require("../utils/heading");

/**
 * Transform a sequence into content groups
 * @param {Array} sequence Flat sequence of elements
 * @returns {Object} Content organized into groups
 */
function processGroups(sequence) {
  const structure = {
    main: null,
    items: [],
    metadata: {
      dividerMode: false,
      groups: 0,
    },
  };

  let currentGroup = null;

  // Check if using divider mode (first divider triggers mode)
  const firstDivider = sequence.findIndex((el) => el.type === "divider");
  structure.metadata.dividerMode = firstDivider !== -1;

  // First pass: identify pretitles and top-level headings
  const pretitles = new Map();
  const topLevelHeadings = [];

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];
    if (element.type === "heading") {
      if (element.level === 1 || element.level === 2) {
        topLevelHeadings.push(element);
      }
      if (element.level === 3) {
        const nextHeading = sequence
          .slice(i + 1)
          .find((el) => el.type === "heading");
        if (nextHeading && nextHeading.level < element.level) {
          pretitles.set(nextHeading, element);
        }
      }
    }
  }

  // Second pass: process groups
  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    // Handle divider mode
    if (structure.metadata.dividerMode) {
      if (element.type === "divider") {
        if (currentGroup) {
          addGroupToStructure(currentGroup, structure);
        }
        currentGroup = createGroup();
        continue;
      }
    }
    // Handle heading mode
    else if (element.type === "heading") {
      if (shouldStartNewGroup(element, currentGroup, sequence, i)) {
        if (currentGroup) {
          addGroupToStructure(currentGroup, structure);
        }
        currentGroup = createGroup();

        // Check if this heading has a pretitle
        const pretitle = pretitles.get(element);
        if (pretitle) {
          currentGroup.headings.pretitle = pretitle;
        }
      }
    }

    // Start first group if needed
    if (!currentGroup) {
      currentGroup = createGroup();
    }

    // Add element to current group (skip elements that became pretitles)
    if (!pretitles.has(element)) {
      addElementToGroup(currentGroup, element);
    }
  }

  // Add final group
  if (currentGroup) {
    addGroupToStructure(currentGroup, structure);
  }

  // Post-process: handle multiple top-level headings
  if (topLevelHeadings.length > 1) {
    if (structure.main) {
      structure.items.unshift(structure.main);
      structure.main = null;
    }
  }

  structure.metadata.groups = structure.items.length + (structure.main ? 1 : 0);
  return structure;
}

/**
 * Create a new empty group
 */
function createGroup() {
  return {
    headings: {
      pretitle: null,
      title: null,
      subtitle: null,
      subsubtitle: null,
    },
    content: [],
    metadata: {
      level: null,
      contentTypes: new Set(),
    },
  };
}

/**
 * Add an element to a group
 */
function addElementToGroup(group, element) {
  // Track content type
  group.metadata.contentTypes.add(element.type);

  if (element.type === "heading") {
    processHeading(group, element);
  } else {
    group.content.push(element);
  }
}

/**
 * Process a heading element and determine its role in the group
 */
function processHeading(group, heading) {
  // If no title yet, this is the title
  if (!group.headings.title) {
    group.headings.title = heading;
    group.metadata.level = heading.level;
    return;
  }

  // If we have a title but no subtitle, and this is lower level
  if (!group.headings.subtitle && heading.level > group.headings.title.level) {
    group.headings.subtitle = heading;
    return;
  }

  // If we have a subtitle but no subsubtitle, and this is lower level
  if (
    group.headings.subtitle &&
    !group.headings.subsubtitle &&
    heading.level > group.headings.subtitle.level
  ) {
    group.headings.subsubtitle = heading;
    return;
  }

  // Otherwise it's content
  group.content.push(heading);
}

module.exports = {
  processGroups,
};
