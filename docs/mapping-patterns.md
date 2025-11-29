# Content Mapping Patterns

This guide shows how to use the mapping utilities to transform parsed content into component-specific formats.

## Overview

The parser provides three types of mapping utilities:

1. **Helpers**: General-purpose utility functions
2. **Accessor**: Path-based extraction with schema support
3. **Extractors**: Pre-built patterns for common components

## Quick Start

```js
const { parseContent, mappers } = require("@uniwebcms/semantic-parser");

const parsed = parseContent(doc);

// Use a pre-built extractor
const heroData = mappers.extractors.hero(parsed);

// Or use schema-based extraction
const customData = mappers.extractBySchema(parsed, {
  title: "groups.main.header.title",
  image: { path: "groups.main.body.imgs[0].url", defaultValue: "/placeholder.jpg" }
});
```

## Helper Utilities

### Array Helpers

```js
const { helpers } = mappers;

// Get first item with default
const image = helpers.first(images, "/default.jpg");

// Get last item
const lastParagraph = helpers.last(paragraphs);

// Transform array
const titles = helpers.transformArray(items, item => item.header.title);

// Filter and transform
const h2s = helpers.filterArray(headings, h => h.level === 2, h => h.content);

// Join text
const description = helpers.joinText(paragraphs, " ");

// Compact (remove null/undefined/empty)
const cleanArray = helpers.compact([null, "text", "", undefined, "more"]);
// => ["text", "more"]
```

### Object Helpers

```js
// Get nested value safely
const title = helpers.get(parsed, "groups.main.header.title", "Untitled");

// Pick specific properties
const metadata = helpers.pick(parsed.groups.main, ["header", "banner"]);

// Omit properties
const withoutMetadata = helpers.omit(item, ["metadata"]);
```

### Validation

```js
// Check if value exists (not null/undefined/empty string)
if (helpers.exists(title)) {
  // title has a value
}

// Validate required fields
const validation = helpers.validateRequired(data, ["title", "image"]);
if (!validation.valid) {
  console.log("Missing fields:", validation.missing);
}
```

### Safe Extraction

```js
// Wrap extraction in try-catch
const safeExtractor = helpers.safe((parsed) => {
  return parsed.groups.main.header.title.toUpperCase();
}, "DEFAULT");

const title = safeExtractor(parsed); // Won't throw if path is invalid
```

## Path-Based Accessor

### Basic Usage

```js
const { accessor } = mappers;

// Simple path
const title = accessor.getByPath(parsed, "groups.main.header.title");

// Array index notation
const firstImage = accessor.getByPath(parsed, "groups.main.body.imgs[0].url");

// With default value
const image = accessor.getByPath(parsed, "groups.main.body.imgs[0].url", {
  defaultValue: "/placeholder.jpg"
});

// With transformation
const description = accessor.getByPath(parsed, "groups.main.body.paragraphs", {
  transform: (paragraphs) => paragraphs.join(" ")
});

// Required field (throws if missing)
const title = accessor.getByPath(parsed, "groups.main.header.title", {
  required: true
});
```

### Schema-Based Extraction

Extract multiple fields at once using a schema:

```js
const schema = {
  // Shorthand: just the path
  title: "groups.main.header.title",

  // Full config with options
  image: {
    path: "groups.main.body.imgs[0].url",
    defaultValue: "/placeholder.jpg"
  },

  description: {
    path: "groups.main.body.paragraphs",
    transform: (p) => p.join(" ")
  },

  cta: {
    path: "groups.main.body.links[0]",
    required: false
  }
};

const data = accessor.extractBySchema(parsed, schema);
// {
//   title: "...",
//   image: "..." or "/placeholder.jpg",
//   description: "...",
//   cta: {...} or null
// }
```

### Array Mapping

Extract data from array of items:

```js
// Simple: extract single field from each item
const titles = accessor.mapArray(parsed, "groups.items", "header.title");
// ["Item 1", "Item 2", "Item 3"]

// Complex: extract multiple fields from each item
const cards = accessor.mapArray(parsed, "groups.items", {
  title: "header.title",
  text: { path: "body.paragraphs", transform: p => p.join(" ") },
  image: { path: "body.imgs[0].url", defaultValue: "/default.jpg" }
});
// [
//   { title: "...", text: "...", image: "..." },
//   { title: "...", text: "...", image: "..." }
// ]
```

### Path Helpers

```js
// Check if path exists
if (accessor.hasPath(parsed, "groups.main.banner.url")) {
  // Banner exists
}

// Get first existing path
const image = accessor.getFirstExisting(parsed, [
  "groups.main.banner.url",
  "groups.main.body.imgs[0].url",
  "groups.items[0].body.imgs[0].url"
], "/fallback.jpg");
```

## Pre-Built Extractors

### Hero Component

Large header with title, image, and CTA:

```js
const heroData = mappers.extractors.hero(parsed);
// {
//   title: "Welcome",
//   subtitle: "Get started today",
//   kicker: "NEW",
//   description: "Join thousands of users...",
//   image: "/hero.jpg",
//   imageAlt: "Hero image",
//   banner: "/banner.jpg",
//   cta: { href: "/signup", label: "Get Started" },
//   button: { content: "Learn More", attrs: {...} }
// }
```

### Card Component

```js
// Single card from main content
const card = mappers.extractors.card(parsed);

// Multiple cards from items
const cards = mappers.extractors.card(parsed, { useItems: true });

// Specific card by index
const firstCard = mappers.extractors.card(parsed, { useItems: true, itemIndex: 0 });
```

### Article Content

```js
const article = mappers.extractors.article(parsed);
// {
//   title: "Article Title",
//   subtitle: "Subtitle",
//   kicker: "FEATURED",
//   author: "John Doe",
//   date: "2024-01-01",
//   banner: "/banner.jpg",
//   content: ["paragraph 1", "paragraph 2"],
//   images: [...],
//   videos: [...],
//   links: [...]
// }
```

### Statistics

```js
const stats = mappers.extractors.stats(parsed);
// [
//   { value: "12", label: "Partner Labs", description: "..." },
//   { value: "$25M", label: "Grant Funding", description: "..." }
// ]
```

### Navigation Menu

```js
const nav = mappers.extractors.navigation(parsed);
// [
//   {
//     label: "Products",
//     href: "/products",
//     children: [
//       { label: "Product 1", href: "/products/1", icon: "..." }
//     ]
//   }
// ]
```

### Features List

```js
const features = mappers.extractors.features(parsed);
// [
//   {
//     title: "Fast Performance",
//     subtitle: "Lightning quick",
//     description: "Our platform is optimized...",
//     icon: "<svg>...</svg>",
//     image: "/feature.jpg",
//     link: { href: "/learn-more", label: "Learn More" }
//   }
// ]
```

### Testimonials

```js
// Single testimonial
const testimonial = mappers.extractors.testimonial(parsed);

// Multiple testimonials from items
const testimonials = mappers.extractors.testimonial(parsed, { useItems: true });
// [
//   {
//     quote: "This product changed our workflow completely!",
//     author: "Jane Smith",
//     role: "CEO",
//     company: "Acme Inc",
//     image: "/jane.jpg",
//     imageAlt: "Jane Smith"
//   }
// ]
```

### FAQ

```js
const faqs = mappers.extractors.faq(parsed);
// [
//   {
//     question: "How does it work?",
//     answer: "Our platform uses advanced algorithms...",
//     links: [...]
//   }
// ]
```

### Pricing Tiers

```js
const tiers = mappers.extractors.pricing(parsed);
// [
//   {
//     name: "Pro",
//     price: "$29/month",
//     description: "For growing teams",
//     features: ["Unlimited users", "API access", "Priority support"],
//     cta: { href: "/signup", label: "Start Free Trial" },
//     highlighted: true
//   }
// ]
```

### Team Members

```js
const team = mappers.extractors.team(parsed);
// [
//   {
//     name: "Dr. Sarah Chen",
//     role: "Lead Researcher",
//     department: "Neuroscience",
//     bio: "Dr. Chen specializes in...",
//     image: "/sarah.jpg",
//     imageAlt: "Dr. Sarah Chen",
//     links: [{ href: "https://twitter.com/...", label: "Twitter" }]
//   }
// ]
```

### Gallery

```js
// All images
const allImages = mappers.extractors.gallery(parsed);

// Only from main content
const mainImages = mappers.extractors.gallery(parsed, { source: "main" });

// Only from items
const itemImages = mappers.extractors.gallery(parsed, { source: "items" });
// [
//   { url: "/image1.jpg", alt: "Image 1", caption: "Caption 1" },
//   { url: "/image2.jpg", alt: "Image 2", caption: "Caption 2" }
// ]
```

## Combining Utilities

You can combine helpers, accessors, and extractors for complex transformations:

```js
const { helpers, accessor, extractors } = mappers;

// Start with a pre-built extractor
const baseData = extractors.hero(parsed);

// Enhance with custom fields
const enhancedData = {
  ...baseData,
  // Add custom field using accessor
  customField: accessor.getByPath(parsed, "groups.main.metadata.custom"),

  // Transform array using helper
  relatedPosts: helpers.transformArray(
    accessor.getByPath(parsed, "groups.items", { defaultValue: [] }),
    item => ({
      title: item.header.title,
      link: helpers.first(item.body.links)
    })
  ),

  // Safe extraction with fallback
  safeData: helpers.safe(() => {
    return parsed.groups.main.complexPath.deepValue.toUpperCase();
  }, "DEFAULT")
};
```

## Engine Integration Example

In your component engine, you might use mappers like this:

```js
// Component provides a schema
const componentSchema = {
  content: {
    type: "hero", // Use pre-built extractor
    // OR
    mapping: {    // Use custom mapping
      brand: "groups.main.header.pretitle",
      title: "groups.main.header.title",
      subtitle: "groups.main.header.subtitle",
      image: { path: "groups.main.body.imgs[0].url", defaultValue: "/default.jpg" },
      actions: {
        path: "groups.main.body.links",
        transform: links => links.map(l => ({ label: l.label, type: "primary" }))
      }
    }
  }
};

// Engine maps content before passing to component
function prepareComponentData(doc, schema) {
  const parsed = parseContent(doc);

  if (schema.content.type) {
    // Use named extractor
    return mappers.extractors[schema.content.type](parsed);
  } else if (schema.content.mapping) {
    // Use custom schema
    return mappers.accessor.extractBySchema(parsed, schema.content.mapping);
  }

  // Fallback to standard parsed structure
  return parsed;
}
```

## Best Practices

1. **Start with extractors**: Use pre-built patterns when they match your needs
2. **Customize gradually**: Override specific fields from extractors if needed
3. **Use schemas for clarity**: Schema-based extraction is self-documenting
4. **Provide defaults**: Always specify default values for optional fields
5. **Safe extraction**: Use `helpers.safe()` when accessing uncertain paths
6. **Validate**: Use `validateRequired()` for critical fields
7. **Type safety**: Consider adding TypeScript definitions for your schemas

## Contributing Patterns

If you develop a common pattern that could benefit others, consider contributing it as a new extractor. Common patterns include:

- Product cards
- Event listings
- Timeline entries
- Contact forms
- Newsletter signups
- Social proof sections
- Comparison tables
