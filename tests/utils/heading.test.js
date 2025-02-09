const {
  shouldStartNewGroup,
  hasGroupHeadings,
  findNextHeading,
} = require("../../src/utils/heading");

describe("heading utilities", () => {
  test("should start new group with no current group", () => {
    const heading = { type: "heading", level: 2 };
    expect(shouldStartNewGroup(heading, null)).toBe(true);
  });

  test("should not start new group if current group is empty", () => {
    const heading = { type: "heading", level: 2 };
    const currentGroup = {
      headings: {
        pretitle: null,
        title: null,
        subtitle: null,
        subsubtitle: null,
      },
      content: [],
      metadata: { level: null },
    };
    expect(shouldStartNewGroup(heading, currentGroup)).toBe(false);
  });

  test("H1 should start new group if current group has content", () => {
    const heading = { type: "heading", level: 1 };
    const currentGroup = {
      headings: { title: { level: 2 } },
      content: ["some content"],
      metadata: { level: 2 },
    };
    expect(shouldStartNewGroup(heading, currentGroup)).toBe(true);
  });

  test("H3 before lower level heading should not start new group", () => {
    const heading = { type: "heading", level: 3 };
    const sequence = [heading, { type: "heading", level: 2 }];
    const position = 0;

    expect(
      shouldStartNewGroup(heading, { content: [] }, sequence, position)
    ).toBe(false);
  });

  test("same level headings should start new group if content exists", () => {
    const heading = { type: "heading", level: 2 };
    const currentGroup = {
      headings: { title: { level: 2 } },
      content: ["some content"],
      metadata: { level: 2 },
    };
    expect(shouldStartNewGroup(heading, currentGroup)).toBe(true);
  });
});

describe("hasGroupHeadings", () => {
  test("detects groups with headings", () => {
    const group = {
      headings: {
        pretitle: { content: "Pre" },
        title: null,
        subtitle: null,
        subsubtitle: null,
      },
    };
    expect(hasGroupHeadings(group)).toBe(true);
  });

  test("detects groups without headings", () => {
    const group = {
      headings: {
        pretitle: null,
        title: null,
        subtitle: null,
        subsubtitle: null,
      },
    };
    expect(hasGroupHeadings(group)).toBe(false);
  });
});

describe("findNextHeading", () => {
  test("finds next heading in sequence", () => {
    const sequence = [
      { type: "paragraph" },
      { type: "heading", level: 2 },
      { type: "paragraph" },
    ];
    expect(findNextHeading(sequence, 0)).toEqual({ type: "heading", level: 2 });
  });

  test("returns null if no next heading", () => {
    const sequence = [
      { type: "paragraph" },
      { type: "heading", level: 2 },
      { type: "paragraph" },
    ];
    expect(findNextHeading(sequence, 1)).toBeNull();
  });
});
