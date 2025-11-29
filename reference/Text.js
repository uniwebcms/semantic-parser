import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Text - A smart typography component for rendering content from semantic-parser
 *
 * Features:
 * - Handles single strings or arrays of paragraphs
 * - Built-in HTML sanitization with DOMPurify
 * - Smart semantic defaults for different content types
 * - Automatic filtering of empty content
 * - Performance optimized with memoization
 *
 * @param {Object} props
 * @param {string|string[]} props.text - The content to render. Can be a string or an array of strings.
 * @param {string} [props.as='p'] - The tag to use for the wrapper or primary semantic element (e.g. 'h1', 'p', 'div').
 * @param {boolean} [props.html=true] - If true, renders content as sanitized HTML.
 * @param {string} [props.className] - Optional className to apply to the outer wrapper or individual elements.
 * @param {string} [props.lineAs] - For array inputs: tag to wrap each line. Defaults to 'div' for headings, 'p' for others.
 * @param {Object} [props.sanitizeConfig] - Custom DOMPurify configuration for HTML sanitization.
 *
 * @example
 * // Simple paragraph (semantic default)
 * <Text text="Hello World" />
 *
 * // Explicit heading
 * <Text text="Hello World" as="h1" />
 *
 * // Multi-line heading
 * <Text text={["Welcome to", "Our Platform"]} as="h1" />
 *
 * // Multiple paragraphs (clean semantic output)
 * <Text text={["First paragraph", "Second paragraph"]} />
 *
 * // Rich HTML content (automatically sanitized by default)
 * <Text text={["Safe <strong>bold</strong> text", "With <em>emphasis</em>"]} />
 *
 * // Plain text when HTML is disabled
 * <Text text="No <strong>formatting</strong> here" html={false} />
 *
 * // Explicit div wrapper when needed
 * <Text text={["Item 1", "Item 2"]} as="div" lineAs="span" />
 */
const Text = React.memo(
  ({ text, as = 'p', html = true, className, lineAs, sanitizeConfig }) => {
    const isArray = Array.isArray(text);
    const Tag = as;
    const isHeading = /^h[1-6]$/.test(as);

    // Default sanitization config - allows common formatting and color marks
    const defaultSanitizeConfig = {
      ALLOWED_TAGS: ['strong', 'em', 'mark', 'span', 'a', 'code', 'br'],
      ALLOWED_ATTR: ['href', 'class', 'data-variant', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    };

    const sanitizerConfig = sanitizeConfig || defaultSanitizeConfig;

    /**
     * Sanitize HTML content safely
     * @param {string} content - Content to sanitize
     * @returns {string} Sanitized content
     */
    const sanitizeHTML = (content) => {
      if (!content || typeof content !== 'string') return '';

      try {
        return DOMPurify.sanitize(content, sanitizerConfig);
      } catch (error) {
        console.warn(
          'Text component: HTML sanitization failed, falling back to plain text:',
          error
        );
        return content.replace(/<[^>]*>/g, ''); // Strip tags as fallback
      }
    };

    /**
     * Filter out empty or whitespace-only strings
     * @param {string[]} contentArray - Array to filter
     * @returns {string[]} Filtered array
     */
    const filterEmptyContent = (contentArray) => {
      return contentArray.filter(
        (item) => typeof item === 'string' && item.trim() !== ''
      );
    };

    // Single string input
    if (!isArray) {
      if (!text || text.trim() === '') return null;

      if (html) {
        const sanitizedHTML = sanitizeHTML(text);
        return (
          <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        );
      }
      return <Tag className={className}>{text}</Tag>;
    }

    // Array input - filter empty content first
    const filteredText = filterEmptyContent(text);

    if (filteredText.length === 0) {
      return null; // Don't render anything for empty arrays
    }

    // Determine the line wrapper tag with smart defaults
    const getLineTag = () => {
      if (lineAs) return lineAs;
      return isHeading ? 'div' : 'p';
    };

    const LineTag = getLineTag();

    // Multi-line heading: wrap all lines in a single heading tag
    if (isHeading) {
      return (
        <Tag className={className}>
          {filteredText.map((line, i) => {
            if (html) {
              const sanitizedHTML = sanitizeHTML(line);
              return (
                <LineTag
                  key={i}
                  dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
              );
            }
            return <LineTag key={i}>{line}</LineTag>;
          })}
        </Tag>
      );
    }

    // Non-heading arrays: render each line as separate element
    return (
      <>
        {filteredText.map((line, i) => {
          if (html) {
            const sanitizedHTML = sanitizeHTML(line);
            return (
              <LineTag
                key={i}
                className={className}
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            );
          }
          return (
            <LineTag key={i} className={className}>
              {line}
            </LineTag>
          );
        })}
      </>
    );
  }
);

Text.displayName = 'Text';

// ============================================================================
// Semantic Wrapper Components - Thin wrappers around Text for common use cases
// ============================================================================

/**
 * H1 - Heading level 1 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h1')
 * @example
 * <H1 text="Main Title" />
 * <H1 text={["Multi-line", "Main Title"]} />
 */
export const H1 = (props) => <Text {...props} as="h1" />;

/**
 * H2 - Heading level 2 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h2')
 */
export const H2 = (props) => <Text {...props} as="h2" />;

/**
 * H3 - Heading level 3 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h3')
 */
export const H3 = (props) => <Text {...props} as="h3" />;

/**
 * H4 - Heading level 4 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h4')
 */
export const H4 = (props) => <Text {...props} as="h4" />;

/**
 * H5 - Heading level 5 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h5')
 */
export const H5 = (props) => <Text {...props} as="h5" />;

/**
 * H6 - Heading level 6 component
 * @param {Object} props - All Text props except 'as' (automatically set to 'h6')
 */
export const H6 = (props) => <Text {...props} as="h6" />;

/**
 * P - Paragraph component (explicitly semantic)
 * @param {Object} props - All Text props except 'as' (automatically set to 'p')
 * @example
 * <P text="A paragraph of content" />
 * <P text={["First paragraph", "Second paragraph"]} />
 */
export const P = (props) => <Text {...props} as="p" />;

/**
 * PlainText - Text component with HTML processing disabled
 * @param {Object} props - All Text props except 'html' (automatically set to false)
 * @example
 * <PlainText text="Display <strong>tags</strong> as literal text" />
 */
export const PlainText = (props) => <Text {...props} html={false} />;

/**
 * Div - Explicit div wrapper component
 * @param {Object} props - All Text props except 'as' (automatically set to 'div')
 * @example
 * <Div text={["Item 1", "Item 2"]} lineAs="span" />
 */
export const Div = (props) => <Text {...props} as="div" />;

// Export all components
export default Text;
