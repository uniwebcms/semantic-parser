# @uniwebcms/semantic-parser

A semantic parser for ProseMirror/TipTap content structures that helps bridge the gap between natural content writing and component-based web development.

## Installation

```bash
npm install @uniwebcms/semantic-parser
```

## Usage

```js
const { parseContent } = require("@uniwebcms/semantic-parser");

// Your ProseMirror/TipTap document
const doc = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Title" }],
    },
    // ...more content
  ],
};

// Parse the content
const parsed = parseContent(doc);

// Access different views of the content
console.log(parsed.sequence); // Flat sequence of elements
console.log(parsed.groups); // Content organized into semantic groups
console.log(parsed.byType); // Content organized by element type
```

## Documentation

See [Content Writing Guide](./docs/guide.md) for detailed information about content structuring conventions.

## License

Apache License 2.0
