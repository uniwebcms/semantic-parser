# Reference Implementations

This folder contains production-ready reference implementations for common patterns when working with the semantic parser. These are **not** part of the published npm package but are provided for you to copy and adapt to your project.

## Available Components

### Text.js

A complete, production-ready React component for rendering content extracted by the semantic parser.

**Features:**
- Handles single strings or arrays of paragraphs
- Built-in HTML sanitization with DOMPurify
- Smart semantic defaults (headings, paragraphs, divs)
- Automatic empty content filtering
- Performance optimized with React.memo
- Semantic wrapper components (H1-H6, P, PlainText, Div)
- Configurable sanitization
- Support for color marks and rich formatting

**Installation:**

1. **Copy the file to your project:**
   ```bash
   cp reference/Text.js src/components/Text.js
   ```

2. **Install DOMPurify dependency:**
   ```bash
   npm install dompurify
   # or
   yarn add dompurify
   ```

3. **Use in your components:**
   ```jsx
   import Text, { H1, P } from './components/Text';
   import { parseContent, mappers } from '@uniwebcms/semantic-parser';

   function MyComponent({ document }) {
     const parsed = parseContent(document);
     const hero = mappers.extractors.hero(parsed);

     return (
       <>
         <H1 text={hero.title} />
         <P text={hero.description} />
       </>
     );
   }
   ```

**TypeScript Support:**

If using TypeScript, add this type definition file:

```typescript
// Text.d.ts
import { ReactElement } from 'react';

interface TextProps {
  text: string | string[];
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';
  html?: boolean;
  className?: string;
  lineAs?: string;
  sanitizeConfig?: {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    ALLOW_DATA_ATTR?: boolean;
  };
}

declare const Text: React.FC<TextProps>;
export default Text;

export const H1: React.FC<Omit<TextProps, 'as'>>;
export const H2: React.FC<Omit<TextProps, 'as'>>;
export const H3: React.FC<Omit<TextProps, 'as'>>;
export const H4: React.FC<Omit<TextProps, 'as'>>;
export const H5: React.FC<Omit<TextProps, 'as'>>;
export const H6: React.FC<Omit<TextProps, 'as'>>;
export const P: React.FC<Omit<TextProps, 'as'>>;
export const PlainText: React.FC<Omit<TextProps, 'html'>>;
export const Div: React.FC<Omit<TextProps, 'as'>>;
```

## Customization

These reference implementations are designed to be copied and customized for your needs:

### Modify Sanitization Config

```jsx
import Text from './components/Text';

// More restrictive sanitization
<Text
  text={content}
  sanitizeConfig={{
    ALLOWED_TAGS: ['strong', 'em'],
    ALLOWED_ATTR: [],
  }}
/>

// More permissive for rich content
<Text
  text={content}
  sanitizeConfig={{
    ALLOWED_TAGS: ['strong', 'em', 'mark', 'span', 'a', 'code', 'br', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'class', 'data-variant', 'target', 'rel'],
  }}
/>
```

### Add Custom Styling Props

```jsx
// Add a spacing prop
const Text = React.memo(({ text, as = 'p', className, spacing = 'normal', ... }) => {
  const spacingClass = spacing !== 'normal' ? `spacing-${spacing}` : '';
  const combinedClass = [className, spacingClass].filter(Boolean).join(' ');

  // Use combinedClass in rendering
});

// Usage
<P text={paragraphs} spacing="comfortable" />
```

### Remove Features You Don't Need

If you don't need certain features, simplify the component:

- Remove sanitization if you sanitize at engine level
- Remove wrapper components if you don't use them
- Remove HTML support if you only render plain text
- Remove array support if you always use strings

## Why Reference Implementations?

The semantic parser is a **data transformation library**, not a UI component library. It focuses on parsing and structuring content.

However, rendering that content requires common patterns that most projects need. Rather than forcing specific implementations, we provide battle-tested reference code that you can:

1. **Copy as-is** - Use immediately without modification
2. **Customize** - Adapt to your specific needs
3. **Learn from** - Understand best practices
4. **Replace** - Use your own implementations

This approach:
- ✅ Keeps the parser lightweight and focused
- ✅ Gives you full control over rendering
- ✅ Avoids forcing UI framework choices
- ✅ Provides working code, not just documentation

## Documentation

For detailed usage guides, see:
- [Text Component Reference](../docs/text-component-reference.md) - Complete documentation
- [Mapping Patterns Guide](../docs/mapping-patterns.md) - Integration examples
- [API Reference](../docs/api.md) - Parser API documentation

## Contributing

If you develop improved versions or new reference implementations, consider contributing them back to help other users.

Common additions that would be valuable:
- Vue.js version of Text component
- Svelte version of Text component
- Image component for handling image data
- Link component for handling link objects
- Video component for media handling

## License

These reference implementations are provided under the same license as the semantic parser (GPL-3.0-or-later) and can be freely used in your projects.
