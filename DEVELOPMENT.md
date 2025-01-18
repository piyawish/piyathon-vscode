# Piyathon VSCode Extension Development Guide

This document provides comprehensive information for developers working on the Piyathon VSCode extension project.

## Project Overview

The Piyathon VSCode Extension is a language support extension for the Piyathon programming language, which is a Thai variant of Python that allows developers to write Python code using Thai keywords. The extension provides syntax highlighting, code formatting, and smart indentation features for `.pi` files.

## Repository Structure

```text
.
├── extension.js                    # Main extension entry point
├── piyathonFormatter.js            # Code formatting implementation
├── python_mappings.json            # Thai-Python keyword mappings
├── language-configuration.json     # Language-specific configuration
├── jsconfig.json                   # JavaScript project configuration
├── eslint.config.mjs               # ESLint configuration
├── jest.config.js                  # Jest test configuration
├── .vscode-test.mjs                # VS Code test configuration
├── icon.png                        # Extension icon
├── syntaxes/                       # TextMate grammar files
│   ├── piyathon.tmLanguage.json
│   └── regexp.tmLanguage.json
├── test/                           # Test files
│   ├── suite/                      # Test suites
│   │   ├── index.js
│   │   └── extension.test.js
│   ├── formatter.test.js           # Formatter-specific tests
│   └── runTest.js                  # Test runner
└── package.json                    # Project configuration and dependencies
```

## Development Setup

1. **Prerequisites**
   - Node.js (Latest LTS version recommended)
   - VS Code (v1.94.0 or higher)
   - Python 3.12 or higher
   - Git

2. **Initial Setup**

   ```bash
   # Clone the repository
   git clone https://github.com/piyawish/piyathon-vscode.git
   cd piyathon-vscode

   # Install dependencies
   npm install

   # Install Python dependencies (if working on Python integration)
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Development Environment**
   - Open the project in VS Code
   - Install recommended extensions (defined in `.vscode/extensions.json`)
   - The project uses JavaScript (not TypeScript)
   - ESLint is configured via `eslint.config.mjs`

## Building and Testing

### Scripts

The project includes several npm scripts for development:

- `npm run lint` - Run ESLint for code quality checks
- `npm run lint:fix` - Automatically fix ESLint issues
- `npm test` - Run all tests (both unit and integration)
- `npm run test:unit` - Run unit tests using Jest
- `npm run test:integration` - Run integration tests
- `npm run vsce` - Package the extension

### Testing

The project uses two testing frameworks:

- **Jest** for unit testing (`test/formatter.test.js`)
  - Configuration in `jest.config.js`
  - Primarily used for testing the formatter logic
- **Mocha** for integration testing (`test/suite/extension.test.js`)
  - VS Code extension testing specific
  - Configuration in `.vscode-test.mjs`

To add new tests:

1. Unit tests should be added in `test/formatter.test.js` or new test files in the test directory
2. Integration tests should be added in `test/suite/extension.test.js`

## Core Components

### 1. Extension Entry Point (`extension.js`)

- Handles extension activation and deactivation
- Registers the document formatting provider for Piyathon files
- Minimal implementation that delegates to the formatter

### 2. Formatter (`piyathonFormatter.js`)

- Implements code formatting logic
- Preserves Thai keywords while applying Python formatting standards
- Uses `python_mappings.json` for keyword translations

### 3. Language Configuration

- `language-configuration.json` defines language-specific settings
- TextMate grammar files in `syntaxes/` handle syntax highlighting
- `python_mappings.json` contains the mapping between Thai and Python keywords

## Contributing

1. **Code Style**
   - Follow ESLint configuration in `eslint.config.mjs`
   - Run `npm run lint` before committing
   - Use meaningful commit messages
   - The project uses JavaScript, not TypeScript

2. **Pull Request Process**
   - Create feature branches from `main`
   - Include tests for new features
   - Ensure all tests pass
   - Update documentation as needed
   - Update `python_mappings.json` if adding new keyword mappings

3. **Version Control**
   - Follow semantic versioning
   - Update CHANGELOG.md for each release
   - Update version in both `package.json` and extension manifest

## Debugging

1. **Local Development**
   - Press F5 in VS Code to launch the extension in debug mode
   - Use the Debug Console for logging
   - Set breakpoints in VS Code
   - Debug configurations are in `.vscode/launch.json`

2. **Common Issues**
   - Check Python extension dependency is installed
   - Verify TextMate grammar syntax
   - Monitor formatting performance with large files
   - Check `python_mappings.json` for keyword translation issues

## Publishing

1. **Preparation**
   - Update version in `package.json`
   - Update CHANGELOG.md
   - Run all tests
   - Check all documentation is current
   - Verify icon.png is present and valid

2. **Publishing Process**

   ```bash
   npm run vsce package
   npm run vsce publish
   ```

   Extension URL: <https://marketplace.visualstudio.com/items?itemName=piyawish.piyathon-vscode>

   INFO  Hub URL: <https://marketplace.visualstudio.com/manage/publishers/piyawish/extensions/piyathon-vscode/hub>

## Dependencies

### Production Dependencies

- VS Code Extension API (`@types/vscode`)
- Python extension (required at runtime)
- No TypeScript dependencies (project is pure JavaScript)

### Development Dependencies

- ESLint for code quality
- Jest and Mocha for testing
- VS Code test utilities
- VSCE for packaging and publishing

## Resources

- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [TextMate Grammar Guide](https://macromates.com/manual/en/language_grammars)
- [Piyathon Language Documentation](https://pypi.org/project/piyathon/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Support

For questions or issues:

1. Check existing GitHub issues
2. Create a new issue with:
   - VS Code version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Python version and environment details if relevant
