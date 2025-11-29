const { processGroups } = require("../../src/processors/groups");
const {
  dividerGroups,
  headingGroups,
  nestedHeadings,
  multipleH1s,
} = require("../fixtures/groups");
const { processSequence } = require("../../src/processors/sequence");

describe("processGroups", () => {
  test("handles divider-based groups", () => {
    const sequence = processSequence(dividerGroups);
    const result = processGroups(sequence);

    expect(result.metadata.dividerMode).toBe(true);
    expect(result.main).toBeTruthy();
    expect(result.items).toHaveLength(2);
    // expect(result.metadata.groups).toBe(3);
  });

  test("handles heading-based groups", () => {
    const sequence = processSequence(headingGroups);
    const result = processGroups(sequence);

    expect(result.metadata.dividerMode).toBe(false);
    expect(result.main).toBeTruthy();
    expect(result.main.header.title).toBe("Features");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].header.title).toBe("Feature One");
  });

  test("correctly processes nested headings", () => {
    const sequence = processSequence(nestedHeadings);
    const result = processGroups(sequence);

    expect(result.main).toBeTruthy();
    expect(result.main.header.pretitle).toBe("WELCOME");
    expect(result.main.header.title).toBe("Main Title");
    expect(result.main.header.subtitle).toBe("Subtitle");
  });

  test("handles multiple H1s by not creating main content", () => {
    const sequence = processSequence(multipleH1s);
    const result = processGroups(sequence);

    expect(result.main).toBeNull();
    expect(result.items).toHaveLength(2);
    expect(result.items[0].header.title).toBe("First H1");
    expect(result.items[1].header.title).toBe("Second H1");
  });
});
