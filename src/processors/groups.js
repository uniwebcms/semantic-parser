/**
 * Transform a sequence into content groups
 * @param {Array} sequence Flat sequence of elements
 * @returns {Object} Content organized into groups
 */
function processGroups(sequence) {
  // Phase 1: Identify group boundaries and create raw groups
  const rawGroups = identifyGroups(sequence);

  // Phase 2: Analyze each group's structure
  const processedGroups = rawGroups.map(analyzeGroupStructure);

  // Phase 3: Handle main content and return final structure
  return organizeMainContent(processedGroups);
}

/**
 * Phase 1: Split sequence into raw groups based on dividers or heading patterns
 */
function identifyGroups(sequence) {
  // Check if using divider mode (first divider triggers mode)
  const hasDivider = sequence.some((el) => el.type === "divider");

  if (hasDivider) {
    return splitByDividers(sequence);
  }

  return splitByHeadings(sequence);
}

/**
 * Split sequence into groups using dividers
 */
function splitByDividers(sequence) {
  const groups = [];
  let currentGroup = [];
  let startsWithDivider = false;

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];
    if (element.type === "divider") {
      // Check if this is the first non-empty element
      if (
        i === 0 ||
        (i > 0 && sequence.slice(0, i).every((el) => el.type === "divider"))
      ) {
        startsWithDivider = true;
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(element);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Add metadata about divider mode
  groups.startsWithDivider = startsWithDivider;

  return groups;
}

/**
 * Split sequence into groups using heading patterns
 */
function splitByHeadings(sequence) {
  const groups = [];
  let currentGroup = [];
  let groupBaseLevel = null;
  let isProcessingHeaders = true;

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "heading") {
      // Handle potential start of new group
      if (groupBaseLevel === null) {
        // First heading sets the base level (unless it's an H3 followed by lower level)
        if (element.level === 3 && hasLowerLevelHeading(sequence, i)) {
          currentGroup.push(element);
          continue;
        }
        groupBaseLevel = element.level;
        currentGroup.push(element);
        continue;
      }

      // If we're still processing headers, check if this continues the current section
      if (isProcessingHeaders) {
        if (element.level > groupBaseLevel) {
          currentGroup.push(element);
          continue;
        }
        isProcessingHeaders = false;
      }

      // Start new group if heading is same or higher importance
      if (element.level <= groupBaseLevel) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groupBaseLevel = element.level;
        isProcessingHeaders = true;
      }

      currentGroup.push(element);
    } else {
      // Non-heading content ends header processing
      isProcessingHeaders = false;
      currentGroup.push(element);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Check if there's a lower level heading following the current position
 */
function hasLowerLevelHeading(sequence, position) {
  for (let i = position + 1; i < sequence.length; i++) {
    const element = sequence[i];
    if (element.type === "heading") {
      return element.level < sequence[position].level;
    }
    if (element.type !== "heading") break;
  }
  return false;
}

/**
 * Phase 2: Analyze the structure of a single group
 */
function analyzeGroupStructure(elements) {
  const group = {
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

  // Find first heading sequence
  let i = 0;
  const headings = [];

  while (i < elements.length && elements[i].type === "heading") {
    headings.push(elements[i]);
    i++;
  }

  // Analyze heading structure
  if (headings.length > 0) {
    // Check for pretitle pattern
    if (
      headings[0].level === 3 &&
      headings.length > 1 &&
      headings[1].level < 3
    ) {
      group.headings.pretitle = headings[0];
      headings.shift();
    }

    // Assign remaining headings
    if (headings.length > 0) {
      group.headings.title = headings[0];
      group.metadata.level = headings[0].level;

      if (headings.length > 1) {
        group.headings.subtitle = headings[1];

        if (headings.length > 2) {
          group.headings.subsubtitle = headings[2];
        }
      }
    }
  }

  // Add remaining elements as content
  while (i < elements.length) {
    const element = elements[i];
    group.content.push(element);
    group.metadata.contentTypes.add(element.type);
    i++;
  }

  return group;
}

/**
 * Phase 3: Organize groups into main content and items
 */
function organizeMainContent(groups) {
  const structure = {
    main: null,
    items: [],
    metadata: {
      groups: groups.length,
    },
  };

  if (groups.length === 0) return structure;

  // If we're in divider mode and content starts with divider, no main content
  if (groups.startsWithDivider) {
    structure.items = groups;
    return structure;
  }

  // Find the lowest heading level (highest importance) in each group
  const groupLevels = groups.map((group) => {
    const headings = [
      group.headings.title,
      ...group.content.filter((el) => el.type === "heading"),
    ].filter(Boolean);

    return headings.length > 0
      ? Math.min(...headings.map((h) => h.level))
      : Infinity;
  });

  // First group can be main content if:
  // 1. It has a title
  // 2. Its lowest heading level is more important (lower number) than other groups
  const firstGroup = groups[0];
  if (firstGroup.headings.title) {
    const firstGroupLevel = groupLevels[0];
    const otherGroupsMinLevel = Math.min(...groupLevels.slice(1));

    // First group has more important headings than others
    if (firstGroupLevel < otherGroupsMinLevel) {
      structure.main = firstGroup;
      structure.items = groups.slice(1);
      return structure;
    }
  }

  // If we get here, first group isn't special enough to be main content
  structure.items = groups;
  return structure;
}

module.exports = {
  processGroups,
};
