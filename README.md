# @uniwebcms/semantic-parser

A semantic parser for ProseMirror/TipTap content structures that helps bridge the gap between natural content writing and component-based web development.

## What it Does

The parser transforms rich text editor content (ProseMirror/TipTap) into structured, semantic groups that web components can easily consume. It provides three complementary views of your content:

1. **Sequence**: A flat, ordered list of all content elements
2. **Groups**: Content organized into semantic sections with identified main content
3. **ByType**: Elements categorized by type for easy filtering and queries

## Installation

```bash
npm install @uniwebcms/semantic-parser
```

## Quick Start

```js
const { parseContent } = require("@uniwebcms/semantic-parser");

// Your ProseMirror/TipTap document
const doc = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Get started today." }],
    },
  ],
};

// Parse the content
const result = parseContent(doc);

// Access different views
console.log(result.sequence);  // Flat array of elements
console.log(result.groups);    // Semantic groups with main/items
console.log(result.byType);    // Elements organized by type
```

## Output Structure

### Sequence View

A flat array of semantic elements preserving document order:

```js
result.sequence = [
  { type: "heading", level: 1, content: "Welcome" },
  { type: "paragraph", content: "Get started today." }
]
```

### Groups View

Content organized into semantic groups:

```js
result.groups = {
  main: {
    header: {
      pretitle: "",           // H3 before main title
      title: "Welcome",       // Main heading
      subtitle: ""            // Heading after main title
    },
    body: {
      paragraphs: ["Get started today."],
      imgs: [],
      videos: [],
      links: [],
      lists: [],
      // ... more content types
    },
    banner: null,             // Optional banner image
    metadata: { level: 1 }
  },
  items: [],                  // Additional content groups
  metadata: {
    dividerMode: false,       // Using dividers vs headings
    groups: 0
  }
}
```

### ByType View

Elements organized by type with context:

```js
result.byType = {
  headings: [
    {
      type: "heading",
      level: 1,
      content: "Welcome",
      context: {
        position: 0,
        previousElement: null,
        nextElement: { type: "paragraph", ... },
        nearestHeading: null
      }
    }
  ],
  paragraphs: [ /* ... */ ],
  images: {
    background: [],
    content: [],
    gallery: [],
    icon: []
  },
  lists: [],
  metadata: {
    totalElements: 2,
    dominantType: "paragraph",
    hasMedia: false
  },
  // Helper methods
  getHeadingsByLevel(level),
  getElementsByHeadingContext(filter)
}
```

## Common Use Cases

### Extracting Main Content

```js
const { groups } = parseContent(doc);

const title = groups.main.header.title;
const description = groups.main.body.paragraphs.join(" ");
const image = groups.main.banner?.url;
```

### Processing Content Sections

```js
const { groups } = parseContent(doc);

// Main content
console.log("Main:", groups.main.header.title);

// Additional sections
groups.items.forEach(item => {
  console.log("Section:", item.header.title);
  console.log("Content:", item.body.paragraphs);
});
```

### Finding Specific Elements

```js
const { byType } = parseContent(doc);

// Get all H2 headings
const subheadings = byType.getHeadingsByLevel(2);

// Get all background images
const backgrounds = byType.images.background;

// Get content under specific headings
const features = byType.getElementsByHeadingContext(
  h => h.content.includes("Features")
);
```

### Sequential Processing

```js
const { sequence } = parseContent(doc);

sequence.forEach(element => {
  switch(element.type) {
    case 'heading':
      renderHeading(element);
      break;
    case 'paragraph':
      renderParagraph(element);
      break;
    case 'image':
      renderImage(element);
      break;
  }
});
```

## Content Grouping

The parser supports two grouping modes:

### Heading-Based Grouping (Default)

Groups are created based on heading patterns. A new group starts when:
- A heading follows content
- Multiple H1s appear (no main content created)
- The heading level indicates a new section

### Divider-Based Grouping

When any horizontal rule (`---`) is present, the entire document uses divider-based grouping. Groups are split explicitly by dividers.

## Text Formatting

Inline formatting is preserved as HTML tags:

```js
// Input: Text with bold mark
// Output: "Text with <strong>bold</strong>"

// Input: Link mark
// Output: "Click <a href=\"/docs\">here</a>"
```

## Documentation

- **[Content Writing Guide](./docs/guide.md)**: Learn how to structure content for optimal parsing
- **[API Reference](./docs/api.md)**: Complete API documentation with all element types
- **[File Structure](./docs/file-structure.md)**: Codebase organization

## Use Cases

- **Component-based websites**: Extract structured data for React/Vue components
- **Content management**: Parse editor content into database-friendly structures
- **Static site generation**: Transform rich content into template-ready data
- **Content analysis**: Analyze document structure and content types

## License

GPL-3.0-or-later
