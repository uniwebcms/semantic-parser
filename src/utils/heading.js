/**
 * Check if a heading should start a new group
 */
function shouldStartNewGroup(
  heading,
  currentGroup,
  sequence = [],
  position = 0
) {
  if (!currentGroup) return true;

  // If current group has no content or headings yet, don't start new one
  if (currentGroup.content.length === 0 && !hasGroupHeadings(currentGroup)) {
    return false;
  }

  // For H3s, check if it's a pretitle for the next heading
  if (heading.level === 3) {
    const nextHeading = findNextHeading(sequence, position);
    if (nextHeading && nextHeading.level < heading.level) {
      return false;
    }
  }

  // Check for multiple H1s
  if (heading.level === 1 && Array.isArray(sequence)) {
    const hasExistingH1 = sequence
      .slice(0, position)
      .some((el) => el.type === "heading" && el.level === 1);

    if (hasExistingH1) {
      return true;
    }
  }

  // For same-level headings, start new group if we already have content
  if (
    currentGroup.headings.title &&
    heading.level === currentGroup.headings.title.level &&
    (currentGroup.content.length > 0 || currentGroup.headings.subtitle)
  ) {
    return true;
  }

  return heading.level <= (currentGroup.metadata.level || Infinity);
}

/**
 * Check if a group has any headings assigned
 */
function hasGroupHeadings(group) {
  if (!group?.headings) return false;

  return Boolean(
    group.headings.pretitle ||
      group.headings.title ||
      group.headings.subtitle ||
      group.headings.subsubtitle
  );
}

/**
 * Find the next heading in the sequence
 */
function findNextHeading(sequence = [], currentPosition = 0) {
  if (!Array.isArray(sequence)) return null;

  for (let i = currentPosition + 1; i < sequence.length; i++) {
    if (sequence[i].type === "heading") {
      return sequence[i];
    }
    // Only look at immediate siblings, stop at content
    if (!["heading", "image"].includes(sequence[i].type)) {
      break;
    }
  }
  return null;
}

/**
 * Check if the document has multiple top-level headings
 */
function hasMultipleTopLevelHeadings(sequence = []) {
  if (!Array.isArray(sequence)) return false;

  const h1s = sequence.filter((el) => el.type === "heading" && el.level === 1);
  if (h1s.length > 1) return true;

  // If no H1s, check for multiple H2s
  if (h1s.length === 0) {
    const h2s = sequence.filter(
      (el) => el.type === "heading" && el.level === 2
    );
    return h2s.length > 1;
  }

  return false;
}

module.exports = {
  shouldStartNewGroup,
  hasGroupHeadings,
  findNextHeading,
  hasMultipleTopLevelHeadings,
};
