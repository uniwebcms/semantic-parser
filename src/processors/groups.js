/**
 * Transform a sequence into content groups with semantic structure
 * @param {Array} sequence Flat sequence of elements
 * @returns {Object} Content organized into groups with identified main content
 */
function processGroups(sequence) {
  const result = {
    main: null,
    items: [],
    metadata: {
      dividerMode: false,
      groups: 0,
    },
  };

  if (!sequence.length) return result;

  // Check if using divider mode
  result.metadata.dividerMode = sequence.some((el) => el.type === "divider");

  // Split sequence into raw groups
  const groups = result.metadata.dividerMode
    ? splitByDividers(sequence)
    : splitByHeadings(sequence);

  // Process each group's structure
  const processedGroups = groups.map(processGroupContent);

  // Special handling for first group in divider mode
  if (result.metadata.dividerMode && groups.startsWithDivider) {
    result.items = processedGroups;
  } else {
    // Organize into main content and items
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
 */
function splitByDividers(sequence) {
  const groups = [];
  let currentGroup = [];
  let startsWithDivider = false;

  // Check if content effectively starts with divider (ignoring whitespace etc)
  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "divider") {
      if (currentGroup.length === 0 && groups.length === 0) {
        startsWithDivider = true;
      } else if (currentGroup.length > 0) {
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

  groups.startsWithDivider = startsWithDivider;
  return groups;
}

/**
 * Split sequence into groups using heading patterns
 */
function splitByHeadings(sequence) {
  const groups = [];
  let currentGroup = [];
  let titleLevel = null;

  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (isPreTitle(sequence, i)) {
      currentGroup.push(sequence[i++]); // move to the next
    }

    if (element.type === "heading") {
      const headings = readHeadingGroup(sequence, i);
      if (titleLevel === null) {
        titleLevel = headings[0].level;
      } else {
        groups.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(...headings);
      i += headings.length - 1; // skip ahead
    } else {
      currentGroup.push(element);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Check if this is a pretitle (H3 followed by H1/H2)
 * @param {*} sequence
 * @param {*} i
 * @returns
 */
function isPreTitle(sequence, i) {
  return (
    i + 1 < sequence.length &&
    sequence[i].type === "heading" &&
    sequence[i + 1].type === "heading" &&
    sequence[i].level === 3 &&
    sequence[i + 1].level <= 2
  );
}

function readHeadingGroup(sequence, i) {
  const elements = [sequence[i]];
  for (i++; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "heading" && element.level > sequence[i - 1].level) {
      elements.push(element);
    }
  }
  return elements;
}

/**
 * Process a group's content to identify its structure
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

  let i = 0;

  // Check for pretitle pattern (H3 followed by H1/H2)
  if (isPreTitle(elements, i)) {
    group.headings.pretitle = elements[i];
    i++;
  }

  // Process title
  if (i < elements.length && elements[i].type === "heading") {
    group.headings.title = elements[i];
    group.metadata.level = elements[i].level;
    i++;

    // Look for subtitle (next level heading)
    if (
      i < elements.length &&
      elements[i].type === "heading" &&
      elements[i].level > group.metadata.level
    ) {
      group.headings.subtitle = elements[i];
      i++;

      // Look for subsubtitle (even deeper heading)
      if (
        i < elements.length &&
        elements[i].type === "heading" &&
        elements[i].level > group.headings.subtitle.level
      ) {
        group.headings.subsubtitle = elements[i];
        i++;
      }
    }
  }

  // All remaining elements are content
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
 */
function identifyMainContent(groups) {
  if (groups.length === 0) return false;

  // Single group with H1/H2 title is main content
  if (groups.length === 1) {
    return true;
    // return groups[0].headings.title && groups[0].metadata.level <= 2;
  }

  // Multiple groups - need to check hierarchy
  const firstGroup = groups[0];
  if (!firstGroup.headings.title) return false;

  // First group should be more important than others to be main
  const firstGroupLevel = firstGroup.metadata.level;
  const otherGroupsMinLevel = Math.min(
    ...groups.slice(1).map((g) => g.metadata.level || Infinity)
  );

  return firstGroupLevel < otherGroupsMinLevel;
}

module.exports = {
  processGroups,
};
