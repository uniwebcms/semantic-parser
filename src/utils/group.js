/**
 * Add a group to the structure determining if it's main or item
 */
function addGroupToStructure(
  group,
  structure,
  hasMultipleTopLevelHeadings = false
) {
  // Convert Set to Array for serialization
  group.metadata.contentTypes = Array.from(group.metadata.contentTypes);

  // If multiple top-level headings, everything goes to items
  if (hasMultipleTopLevelHeadings) {
    structure.items.push(group);
    return;
  }

  // Determine if this is the main group
  if (!structure.main && isMainGroup(group)) {
    structure.main = group;
  } else {
    structure.items.push(group);
  }
}

/**
 * Check if a group qualifies as the main group
 */
function isMainGroup(group) {
  // Must have a title
  if (!group.headings.title) return false;

  const level = group.headings.title.level;
  return level === 1 || level === 2;
}

module.exports = {
  addGroupToStructure,
  isMainGroup,
};
