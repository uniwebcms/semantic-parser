module.exports = {
  dividerGroups: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Main Section" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Main content." }],
      },
      {
        type: "horizontalRule",
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "First group content." }],
      },
      {
        type: "horizontalRule",
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Second group content." }],
      },
    ],
  },

  headingGroups: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Features" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Our main features." }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Feature One" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "First feature description." }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Feature Two" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Second feature description." }],
      },
    ],
  },

  nestedHeadings: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "WELCOME" }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Main Title" }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Subtitle" }],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Subsubtitle" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Content." }],
      },
    ],
  },

  multipleH1s: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "First H1" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "First content." }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Second H1" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Second content." }],
      },
    ],
  },
};
