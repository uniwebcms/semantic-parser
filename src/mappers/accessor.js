/**
 * Path-based accessor for extracting values from parsed content
 */

/**
 * Parse a path string into segments, handling array indices
 * @param {string} path - Path string (e.g., 'groups.main.body.imgs[0].url')
 * @returns {Array} Array of path segments
 */
function parsePath(path) {
    const segments = [];
    const parts = path.split('.');

    for (const part of parts) {
        // Check for array index notation: key[0]
        const match = part.match(/^(.+?)\[(\d+)\]$/);
        if (match) {
            segments.push({ key: match[1], type: 'object' });
            segments.push({ index: parseInt(match[2], 10), type: 'array' });
        } else {
            segments.push({ key: part, type: 'object' });
        }
    }

    return segments;
}

/**
 * Get value at path from parsed content
 * @param {Object} parsed - Parsed content from parseContent()
 * @param {string} path - Path to value (e.g., 'groups.main.header.title')
 * @param {Object} options - Options for extraction
 * @param {*} options.defaultValue - Default value if path doesn't exist
 * @param {Function} options.transform - Transformation function to apply to value
 * @param {boolean} options.required - Throw error if value is missing
 * @returns {*} Value at path
 */
function getByPath(parsed, path, options = {}) {
    const { defaultValue, transform, required = false } = options;

    if (!parsed || !path) {
        if (required) {
            throw new Error('Path is required');
        }
        return defaultValue;
    }

    const segments = parsePath(path);
    let current = parsed;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (current === null || current === undefined) {
            if (required) {
                throw new Error(`Required field missing at path: ${path}`);
            }
            return defaultValue;
        }

        if (segment.type === 'array') {
            if (!Array.isArray(current)) {
                if (required) {
                    throw new Error(`Expected array at path segment ${i} in: ${path}`);
                }
                return defaultValue;
            }
            current = current[segment.index];
        } else {
            current = current[segment.key];
        }
    }

    const value = current !== undefined ? current : defaultValue;

    if (required && (value === undefined || value === null)) {
        throw new Error(`Required field missing at path: ${path}`);
    }

    return transform ? transform(value) : value;
}

/**
 * Extract multiple values using a schema
 * @param {Object} parsed - Parsed content from parseContent()
 * @param {Object} schema - Schema defining paths and transformations
 * @returns {Object} Extracted values
 *
 * @example
 * const schema = {
 *   title: 'groups.main.header.title',
 *   image: { path: 'groups.main.body.imgs[0].url', defaultValue: '/placeholder.jpg' },
 *   description: { path: 'groups.main.body.paragraphs', transform: (p) => p.join(' ') }
 * };
 * const data = extractBySchema(parsed, schema);
 */
function extractBySchema(parsed, schema) {
    const result = {};

    for (const [key, config] of Object.entries(schema)) {
        // Allow shorthand: key: 'path.to.value'
        if (typeof config === 'string') {
            result[key] = getByPath(parsed, config);
        } else {
            // Full config: { path, defaultValue, transform, required }
            const { path, ...options } = config;
            result[key] = getByPath(parsed, path, options);
        }
    }

    return result;
}

/**
 * Check if a path exists in parsed content
 * @param {Object} parsed - Parsed content
 * @param {string} path - Path to check
 * @returns {boolean} True if path exists and has a non-null/undefined value
 */
function hasPath(parsed, path) {
    try {
        const value = getByPath(parsed, path);
        return value !== null && value !== undefined;
    } catch {
        return false;
    }
}

/**
 * Get multiple paths, return first that exists
 * @param {Object} parsed - Parsed content
 * @param {Array<string>} paths - Array of paths to try
 * @param {*} defaultValue - Default if none exist
 * @returns {*} First existing value or default
 */
function getFirstExisting(parsed, paths, defaultValue = null) {
    for (const path of paths) {
        if (hasPath(parsed, path)) {
            return getByPath(parsed, path);
        }
    }
    return defaultValue;
}

/**
 * Extract values from array of items using same path
 * @param {Object} parsed - Parsed content
 * @param {string} arrayPath - Path to array
 * @param {string|Object} itemConfig - Path or config for each item
 * @returns {Array} Extracted values
 *
 * @example
 * // Get all item titles
 * mapArray(parsed, 'groups.items', 'header.title')
 *
 * // Get objects from each item
 * mapArray(parsed, 'groups.items', {
 *   title: 'header.title',
 *   text: { path: 'body.paragraphs', transform: p => p.join(' ') }
 * })
 */
function mapArray(parsed, arrayPath, itemConfig) {
    const array = getByPath(parsed, arrayPath, { defaultValue: [] });

    if (!Array.isArray(array)) {
        return [];
    }

    return array.map(item => {
        if (typeof itemConfig === 'string') {
            return getByPath({ item }, `item.${itemConfig}`);
        } else {
            return extractBySchema({ item },
                Object.entries(itemConfig).reduce((acc, [key, config]) => {
                    if (typeof config === 'string') {
                        acc[key] = `item.${config}`;
                    } else {
                        acc[key] = { ...config, path: `item.${config.path}` };
                    }
                    return acc;
                }, {})
            );
        }
    });
}

module.exports = {
    getByPath,
    extractBySchema,
    hasPath,
    getFirstExisting,
    mapArray
};
