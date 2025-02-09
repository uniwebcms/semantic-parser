module.exports = {
  simpleDocument: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Main Title" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Main content paragraph." }],
      },
    ],
  },

  withPretitle: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "PRETITLE" }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Main Title" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Content." }],
      },
    ],
  },

  withFormattedText: {
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
          { type: "text", text: " and " },
          {
            type: "text",
            marks: [{ type: "italic" }],
            text: "italic",
          },
          { type: "text", text: " text." },
        ],
      },
    ],
  },

  withImage: {
    type: "doc",
    content: [
      {
        type: "image",
        attrs: {
          src: "test.jpg",
          alt: "Test image",
          role: "background",
        },
      },
    ],
  },
};
