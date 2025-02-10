/**
 * Transform a sequence into content groups with semantic structure
 * @param {Array} sequence Flat sequence of elements
 * @returns {Object} Content organized into groups with identified main content
 */
function processGroups(sequence) {
  // Initialize result structure
  const result = {
    main: null,
    items: [],
    metadata: {
      dividerMode: false,
      groups: 0,
    },
  };

  if (!sequence.length) return result;

  // Check grouping mode - divider mode takes precedence if any divider exists
  result.metadata.dividerMode = sequence.some((el) => el.type === "divider");

  // Split into raw groups based on mode
  const groups = result.metadata.dividerMode
    ? splitByDividers(sequence)
    : splitByHeadings(sequence);

  // Early return if no groups formed
  if (!groups.length) return result;

  // Process each group to identify its structure
  const processedGroups = groups.map(processGroupContent);

  // Special handling for first group in divider mode
  if (result.metadata.dividerMode && groups.startsWithDivider) {
    result.items = processedGroups;
  } else {
    // Check if first group should be main content
    const shouldBeMain = identifyMainContent(processedGroups);
    if (shouldBeMain) {
      result.main = processedGroups[0];
      result.items = processedGroups.slice(1);
    } else {
      result.items = processedGroups;
    }
  }

  result.metadata.groups = processedGroups.length;
  return result;
}

/**
 * Split sequence into groups using dividers
 * @param {Array} sequence
 * @returns {Array} Groups with startsWithDivider metadata
 */
function splitByDividers(sequence) {
  const groups = [];
  let currentGroup = [];
  let startsWithDivider = false;

  // Handle empty elements at start to determine if truly starts with divider
  let contentStarted = false;

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "divider") {
      if (!contentStarted) {
        startsWithDivider = true;
      } else if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else {
      contentStarted = true;
      currentGroup.push(element);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  groups.startsWithDivider = startsWithDivider;
  return groups;
}

/**
 * Split sequence into groups using heading hierarchy
 * @param {Array} sequence
 * @returns {Array} Groups
 */
function splitByHeadings(sequence) {
  const groups = [];
  let currentGroup = [];
  let baseLevel = null;
  let isProcessingHeaders = true;

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "heading") {
      if (baseLevel === null) {
        // Skip initial H3 if it's followed by lower level heading
        if (element.level === 3 && hasLowerLevelHeading(sequence, i)) {
          currentGroup.push(element);
          continue;
        }
        baseLevel = element.level;
        currentGroup.push(element);
        continue;
      }

      // If still in header section, continue if level is higher (lower importance)
      if (isProcessingHeaders && element.level > baseLevel) {
        currentGroup.push(element);
        continue;
      }

      // Start new group if heading is same or higher importance
      if (element.level <= baseLevel) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        baseLevel = element.level;
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
 * Check if there's a lower level heading after current position
 * @param {Array} sequence
 * @param {number} position
 * @returns {boolean}
 */
function hasLowerLevelHeading(sequence, position) {
  const currentLevel = sequence[position].level;

  for (let i = position + 1; i < sequence.length; i++) {
    const element = sequence[i];
    if (element.type === "heading") {
      return element.level < currentLevel;
    }
    if (element.type !== "heading") break;
  }
  return false;
}

/**
 * Process a group's content to identify its structure
 * @param {Array} elements
 * @returns {Object} Structured group
 */
function processGroupContent(elements) {
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

  // Find initial heading sequence
  let headings = [];
  let i = 0;

  while (i < elements.length && elements[i].type === "heading") {
    headings.push(elements[i]);
    i++;
  }

  // Process heading structure
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

    // Process remaining headings
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
 * Determine if the first group should be treated as main content
 * @param {Array} groups Processed groups
 * @returns {boolean}
 */
function identifyMainContent(groups) {
  if (groups.length < 1) return false;

  const firstGroup = groups[0];
  if (!firstGroup.headings.title) return false;

  // Get the minimum heading level (highest importance) from each group
  const getMinLevel = (group) => {
    const headings = [
      group.headings.title,
      ...group.content.filter((el) => el.type === "heading"),
    ].filter(Boolean);

    return headings.length > 0
      ? Math.min(...headings.map((h) => h.level))
      : Infinity;
  };

  const firstGroupLevel = getMinLevel(firstGroup);
  const otherGroupsMinLevel = Math.min(...groups.slice(1).map(getMinLevel));

  // First group should be main content if it has more important headings
  return firstGroupLevel < otherGroupsMinLevel;
}

module.exports = {
  processGroups,
};
