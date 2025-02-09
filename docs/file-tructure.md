# File Structure

```
semantic-parser/
├── package.json
├── README.md
├── src/
│   ├── index.js          # Main entry point and API
│   ├── parser.js         # Core parsing function
│   ├── processors/
│   │   ├── sequence.js   # Processes flat sequence
│   │   ├── groups.js     # Handles content grouping
│   │   └── byType.js     # Organizes by element type
│   └── utils/
│       ├── heading.js    # Heading hierarchy utilities
│       ├── group.js      # Group creation/management
│       └── role.js       # Role detection for media/links
├── tests/
│   ├── parser.test.js    # Core parser tests
│   ├── processors/
│   │   ├── sequence.test.js
│   │   ├── groups.test.js
│   │   └── byType.test.js
│   └── fixtures/
│       ├── basic.js      # Simple test cases
│       ├── groups.js     # Group formation cases
│       └── complex.js    # Edge cases/combinations
└── docs/
    └── guide.md          # Integration guide
```
