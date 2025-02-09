const { processSequence } = require("../../src/processors/sequence");

describe("processSequence", () => {
  test("processes basic document structure", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Content" }],
        },
      ],
    };

    const result = processSequence(doc);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: "heading",
      level: 1,
      content: "Title",
    });
    expect(result[1]).toEqual({
      type: "paragraph",
      content: "Content",
    });
  });

  test("handles text marks", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Normal " },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "bold",
            },
          ],
        },
      ],
    };

    const result = processSequence(doc);
    expect(result[0].content).toBe("Normal bold");
    expect(result[0].marks).toBeDefined();
  });

  test("processes nested lists", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 1" }],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Nested" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = processSequence(doc);
    expect(result[0].type).toBe("list");
    expect(result[0].style).toBe("bullet");
  });

  test("preserves image attributes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "image",
          attrs: {
            src: "test.jpg",
            alt: "Test",
            role: "background",
          },
        },
      ],
    };

    const result = processSequence(doc);
    expect(result[0]).toEqual({
      type: "image",
      src: "test.jpg",
      alt: "Test",
      role: "background",
    });
  });
});
