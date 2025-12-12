/**
 * Transform a sequence into content groups with semantic structure
 * @param {Array} sequence Flat sequence of elements
 * @param {Object} options Parsing options
 * @returns {Object} Content organized into groups with identified main content
 */
function processGroups(sequence, options = {}) {
    const result = {
        main: null,
        items: [],
        metadata: {
            dividerMode: false,
            groups: 0,
        },
    };

    if (!sequence.length) return result;

    // Check if using divider mode
    result.metadata.dividerMode = sequence.some((el) => el.type === "divider");

    // Split sequence into raw groups
    const groups = result.metadata.dividerMode
        ? splitByDividers(sequence)
        : splitByHeadings(sequence);

    // Process each group's structure
    const processedGroups = groups.map((group) => processGroupContent(group));

    // Special handling for first group in divider mode
    if (result.metadata.dividerMode && groups.startsWithDivider) {
        result.items = processedGroups;
    } else {
        // Organize into main content and items
        const shouldBeMain = identifyMainContent(processedGroups);
        if (shouldBeMain) {
            result.main = processedGroups[0];
            result.items = processedGroups.slice(1);
        } else {
            result.items = processedGroups;
        }
    }

    // result.metadata.groups = processedGroups.length;
    return result;
}

/**
 * Split sequence into groups using dividers
 */
function splitByDividers(sequence) {
    const groups = [];
    let currentGroup = [];
    let startsWithDivider = false;

    // Check if content effectively starts with divider (ignoring whitespace etc)
    for (let i = 0; i < sequence.length; i++) {
        const element = sequence[i];

        if (element.type === "divider") {
            if (currentGroup.length === 0 && groups.length === 0) {
                startsWithDivider = true;
            } else if (currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        } else {
            currentGroup.push(element);
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    groups.startsWithDivider = startsWithDivider;
    return groups;
}

/**
 * Split sequence into groups using heading patterns
 */
function splitByHeadings(sequence) {
    const groups = [];
    let currentGroup = [];
    let isPreOpened = false;

    // Consider if current group is pre opened (only has banner or pretitle)
    // before starting a new group.
    const startGroup = (preOpen) => {
        if (currentGroup.length && !isPreOpened) {
            groups.push(currentGroup);
            currentGroup = [];
        }
        isPreOpened = preOpen;
    };

    for (let i = 0; i < sequence.length; i++) {
        // Only allow a banner for the first group
        if (!groups.length && isBannerImage(sequence, i)) {
            startGroup(true); // pre open a new group
            currentGroup.push(sequence[i]);
            i++; // move to known next element (it will be a heading)
        }

        // Handle special pretitle case before consuming all consecutive
        // headings with increasing levels
        if (isPreTitle(sequence, i)) {
            startGroup(true); // pre open a new group
            currentGroup.push(sequence[i]);
            i++; // move to known next element (it will be a heading)
        }

        const element = sequence[i];

        if (element.type === "heading") {
            const headings = readHeadingGroup(sequence, i);

            startGroup(false);

            // Add headings to the current group
            currentGroup.push(...headings);
            i += headings.length - 1; // skip all the added headings
        } else {
            currentGroup.push(element);
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Check if this is a pretitle - any heading followed by a more important heading
 * (e.g., H3→H1, H2→H1, H6→H5, etc.)
 */
function isPreTitle(sequence, i) {
    return (
        i + 1 < sequence.length &&
        sequence[i].type === "heading" &&
        sequence[i + 1].type === "heading" &&
        sequence[i].level > sequence[i + 1].level // Smaller heading before larger
    );
}

function isBannerImage(sequence, i) {
    return (
        i + 1 < sequence.length &&
        sequence[i].type === "image" &&
        (sequence[i].role === "banner" || sequence[i + 1].type === "heading")
    );
}

/**
 * Eagerly consume consecutive headings.
 * It intelligently decides if a heading is a Subtitle (Merge) or a List Item (Split)
 * based on whether it has children compared to its peers.
 */
function readHeadingGroup(sequence, startIndex) {
    const elements = [sequence[startIndex]];
    let currentLevel = sequence[startIndex].level;

    for (let i = startIndex + 1; i < sequence.length; i++) {
        const element = sequence[i];

        // 1. Basic Structure Check: Must be a heading of a deeper (or same) level
        // We stop immediately if we hit a higher heading (e.g. H2 -> H1)
        if (
            element.type !== "heading" ||
            element.level <= sequence[startIndex].level
        ) {
            break;
        }

        // 2. Sibling Boundary (The Fix):
        // If we are already at Level X (e.g., consumed a Subtitle), and we see another Level X,
        // it is a sibling. We must break to let it start its own group.
        if (element.level === currentLevel) {
            break;
        }

        // 3. Ambiguous First-Child Strategy
        // If we are stepping DOWN (H1 -> H2), check if this H2 is actually an Item (Resume pattern).
        if (hasPeerInScope(sequence, i)) {
            // "Leaf vs Branch" Heuristic:
            // If the current heading is a Leaf (no children) AND its peer is a Branch (has children),
            // we treat this as a Subtitle (Merge). Otherwise, it's an Item (Split).
            const isLeaf = !hasChildInScope(sequence, i);
            const peerIsBranch = peerHasChildInScope(sequence, i);

            // !(isLeaf && peerIsBranch)
            if (!isLeaf || !peerIsBranch) {
                // It fails the subtitle check. It is an Item. Split here.
                break;
            }

            // If we are here, it's a Subtitle (Leaf). Merge it.
        }

        // 3. Consume
        elements.push(element);
        currentLevel = element.level;
    }

    return elements;
}

/**
 * Check if there is another heading of the same level later in this section
 */
function hasPeerInScope(sequence, currentIndex) {
    const targetLevel = sequence[currentIndex].level;

    // Scan ahead until we hit a boundary (heading of higher or equal importance)
    for (let k = currentIndex + 1; k < sequence.length; k++) {
        const el = sequence[k];
        if (el.type === "heading") {
            if (el.level < targetLevel) return false; // Left the scope (e.g. hit H1)
            if (el.level === targetLevel) return true; // Found a peer!
        }
    }
    return false;
}

/**
 * Check if the current heading has any sub-headings (children) underneath it
 */
function hasChildInScope(sequence, currentIndex) {
    const parentLevel = sequence[currentIndex].level;

    for (let k = currentIndex + 1; k < sequence.length; k++) {
        const el = sequence[k];
        if (el.type === "heading") {
            // If we hit a sibling or parent, we stopped looking without finding a child
            if (el.level <= parentLevel) return false;
            // If we find a deeper level, it IS a child
            if (el.level > parentLevel) return true;
        }
    }
    return false;
}

/**
 * Look ahead to the *next* peer and see if THAT peer has children.
 */
function peerHasChildInScope(sequence, currentIndex) {
    const targetLevel = sequence[currentIndex].level;
    let peerIndex = -1;

    // 1. Find the index of the next peer
    for (let k = currentIndex + 1; k < sequence.length; k++) {
        const el = sequence[k];
        if (el.type === "heading") {
            if (el.level < targetLevel) return false; // Scope ended
            if (el.level === targetLevel) {
                peerIndex = k;
                break;
            }
        }
    }

    // 2. If found, check if that peer has children
    if (peerIndex !== -1) {
        return hasChildInScope(sequence, peerIndex);
    }

    return false;
}

/**
 * Process a group's content to identify its structure
 */
function processGroupContent(elements) {
    const header = {
        pretitle: "",
        title: "",
        subtitle: "",
        subtitle2: "",
        alignment: null,
    };
    let banner = null;
    const body = {
        imgs: [],
        icons: [],
        videos: [],
        paragraphs: [],
        links: [],
        lists: [],
        buttons: [],
        properties: {},
        propertyBlocks: [],
        cards: [],
        documents: [],
        forms: [],
        quotes: [],
        headings: [],
    };

    const metadata = {
        level: null,
        contentTypes: new Set(),
    };

    if (!elements)
        return {
            header,
            body,
            banner,
            metadata,
        };

    for (let i = 0; i < elements.length; i++) {
        //We shuold only set pretitle and banner image once
        if (isPreTitle(elements, i) && !header.pretitle) {
            header.pretitle = elements[i].text;
            i++; // move to known next heading (H1 or h2)
        }

        if (isBannerImage(elements, i) && !banner) {
            banner = {
                url: elements[i].src,
                caption: elements[i].caption,
                alt: elements[i].alt,
            };
            i++;
        }

        const element = elements[i];

        if (element.type === "heading") {
            if (element.children && Array.isArray(element.children))
                processInlineElements(element.children, body);

            //We shuold set the group level to the highest one instead of the first one.
            metadata.level ??= element.level;

            // Extract alignment from first heading
            if (!header.alignment && element.attrs?.textAlign) {
                header.alignment = element.attrs.textAlign;
            }
            // h3 h2 h1 h1
            // Assign to header fields
            // h3 h2 h3 h4
            if (!header.title) {
                header.title = element.text;
            } else if (!header.subtitle) {
                header.subtitle = element.text;
            } else if (!header.subtitle2) {
                header.subtitle2 = element.text;
            } else {
                // After subtitle2, we're in body - collect heading
                body.headings.push(element.text);
            }
        } else if (element.type === "list") {
            const listItems = element.children;

            body.lists.push(
                listItems.map((listItem) => processGroupContent(listItem).body)
            );
        } else {
            let preserveProps = {
                ...element.attrs,
            };

            switch (element.type) {
                case "paragraph":
                    if (element.children && Array.isArray(element.children))
                        processInlineElements(element.children, body);

                    body.paragraphs.push(element.text);
                    break;

                case "image":
                    body.imgs.push(preserveProps);
                    break;

                case "video":
                    body.videos.push(preserveProps);
                    break;

                case "link":
                    body.links.push(preserveProps);
                    break;

                case "icon":
                    body.icons.push(preserveProps);
                    break;

                case "button":
                    body.buttons.push({
                        attrs: element.attrs,
                        content: element.text,
                    });
                    break;

                case "blockquote":
                    // Process blockquote content recursively
                    const quoteContent = processGroupContent(element.children);
                    body.quotes.push(quoteContent.body);
                    break;

                case "codeBlock":
                    const codeData = element.text;
                    body.properties = codeData; // Last one
                    body.propertyBlocks.push(codeData); // All of them
                    break;

                case "form":
                    body.forms.push(element.data || element.attrs);
                    break;

                case "card-group":
                    body.cards.push(...element.cards);
                    break;

                case "document-group":
                    body.documents.push(...element.documents);
                    break;
            }
        }
    }

    return {
        header,
        body,
        banner,
        metadata,
    };
}

/**
 * Determine if the first group should be treated as main content
 */
function identifyMainContent(groups) {
    if (groups.length === 0) return false;

    // Single group is main content
    if (groups.length === 1) return true;

    // First group should be more important (lower level) than second to be main
    const first = groups[0].metadata.level;
    const second = groups[1].metadata.level;

    return first ? !second || first < second : false;
}

function processInlineElements(children, body) {
    children.forEach((item) => {
        //Handle icons only for now
        if (item.type === "icon") {
            body.icons.push(item);
        }
    });
}

export { processGroups };
