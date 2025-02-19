/**
 * Process a ProseMirror/TipTap document into a flat sequence
 * @param {Object} doc ProseMirror document
 * @returns {Array} Sequence of content elements
 */
function processSequence(doc) {
    const sequence = [];
    processNode(doc, sequence);

    return sequence;
}

function processNode(node, sequence) {
    // Special handling for root doc node
    if (node.type === 'doc') {
        node.content?.forEach((child) => processNode(child, sequence));
        return;
    }

    // Create element based on node type
    const element = createSequenceElement(node);

    if (element) {
        sequence.push(element);
    }
}

function createSequenceElement(node) {
    function isLink() {
        if (node.type === 'paragraph' && node.content.length === 1) {
            return node.content[0].marks?.some((mark) => mark.type === 'link') || false;
        }
    }

    function isImage() {
        if (node.type === 'paragraph' && node.content.length === 1) {
            return node.content[0].type === 'image' && (node.content[0].attrs.role === 'image' || node.content[0].attrs.role === 'banner');
        }
    }

    function isIcon() {
        if (node.type === 'paragraph' && node.content.length === 1) {
            return node.content[0].type === 'image' && node.content[0].attrs.role === 'icon';
        }
    }

    function isButton() {
        if (node.type === 'paragraph' && node.content.length === 1) {
            return node.content[0].type === 'text' && node.content[0].marks?.some((mark) => mark.type === 'button');
        }
    }

    function isVideo() {
        if (node.type === 'paragraph' && node.content.length === 1) {
            return node.content[0].type === 'image' && node.content[0].attrs.role === 'video';
        }
    }

    // extract pure [type] content from the paragraph node for easier handling in the byGroup processor
    if (isLink()) {
        return {
            type: 'link',
            content: {
                href: node.content[0].marks.find((mark) => mark.type === 'link').attrs.href,
                label: node.content[0].text
            }
        };
    }

    if (isImage()) {
        return {
            type: 'image',
            src: node.content[0].attrs.src,
            caption: node.content[0].attrs.title,
            alt: node.content[0].attrs.alt || node.content[0].attrs.title,
            role: node.content[0].attrs.role
        };
    }

    if (isIcon()) {
        return {
            type: 'icon',
            svg: node.content[0].attrs.svg
        };
    }

    if (isButton()) {
        return {
            type: 'button',
            content: node.content[0].text,
            attrs: node.content[0].marks.find((mark) => mark.type === 'button').attrs
        };
    }

    if (isVideo()) {
        return {
            type: 'video',
            src: node.content[0].attrs.src,
            caption: node.content[0].attrs.title,
            alt: node.content[0].attrs.alt || node.content[0].attrs.title
        };
    }

    switch (node.type) {
        case 'heading':
            return {
                type: 'heading',
                level: node.attrs.level,
                content: getTextContent(node)
            };

        case 'paragraph':
            return {
                type: 'paragraph',
                content: getTextContent(node)
            };

        case 'image':
            return {
                type: 'image',
                src: node.attrs.src,
                alt: node.attrs.alt,
                role: node.attrs.role
            };

        case 'bulletList':
        case 'orderedList':
            return {
                type: 'list',
                style: node.type === 'bulletList' ? 'bullet' : 'ordered',
                items: processListItems(node)
            };

        case 'listItem':
            return {
                type: 'listItem',
                content: getTextContent(node)
            };

        case 'horizontalRule':
            return {
                type: 'divider'
            };

        case 'text':
            return null;

        default:
            return {
                type: node.type,
                content: getTextContent(node)
            };
    }
}

function getTextContent(node) {
    if (!node.content) return '';

    return node.content.reduce((prev, curr) => {
        const { type, marks = [], text } = curr;

        if (type === 'text') {
            let styledText = '';
            if (marks.some((mark) => mark.type === 'link')) {
                styledText = `<a href="${marks.find((mark) => mark.type === 'link').attrs.href}">${text}</a>`;
            }

            if (marks.some((mark) => mark.type === 'bold')) {
                styledText = `<strong>${text}</strong>`;
            }

            if (marks.some((mark) => mark.type === 'italic')) {
                styledText = `<em>${text}</em>`;
            }

            if (!marks.length) {
                styledText = text;
            }

            return prev + styledText;
        } else {
            console.warn(`unhandled text content type: ${type}`, curr);
        }
    }, '');
}

function processListItems(node) {
    const items = [];
    node.content?.forEach((item) => {
        if (item.type === 'listItem') {
            items.push({
                content: item.content?.filter((child) => !child.type.endsWith('List'))?.map((child) => createSequenceElement(child)),
                items: item.content?.filter((child) => child.type.endsWith('List')).flatMap((list) => processListItems(list))
            });
        }
    });

    return items;
}

module.exports = {
    processSequence
};
