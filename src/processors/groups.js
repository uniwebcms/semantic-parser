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

  // result.metadata.groups = processedGroups.length;
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
      currentGroup.push(sequence[i]);
      i++; // move to known next heading (H1 or h2)
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
  const content = [];
  const headings = {
    pretitle: null,
    title: null,
    subtitle: null,
    subsubtitle: null,
  };
  const metadata = {
    level: null,
    contentTypes: new Set(),
  };

  for (let i = 0; i < elements.length; i++) {
    if (isPreTitle(elements, i)) {
      headings.pretitle = elements[i];
      i++; // move to known next heading (H1 or h2)
    }

    const element = elements[i];

    if (element.type === "heading") {
      metadata.level ??= element.level;

      if (!headings.title) {
        headings.title = element;
      } else if (!headings.subtitle) {
        headings.subtitle = element;
      } else if (!headings.subsubtitle) {
        headings.subsubtitle = element;
      }
      // What do we do if more headings?
    } else {
      content.push(element);
      metadata.contentTypes.add(element.type);
    }
  }

  return { headings, content, metadata };
}

/**
 * Determine if the first group should be treated as main content
 */
function identifyMainContent(groups) {
  if (groups.length === 0) return false;

  // Single group is main content
  if (groups.length === 1) return true;

  // First group should be more important (lower level) than second to be main
  const first = groups[0].metadata.level;
  const second = groups[1].metadata.level;

  return first ? !second || first < second : false;
}

module.exports = {
  processGroups,
};
