# Piyathon VSCode Extension

Piyathon VSCode Extension provides language support for the Piyathon programming language - a Thai variant of Python that allows developers to write Python code using Thai keywords.

## Features

- **Syntax Highlighting**: Full syntax highlighting support for Piyathon (`.pi`) files
- **Thai Keyword Support**: Write Python code using Thai keywords:
  - `นิยาม` for `def`
  - `คลาส` for `class`
  - `จริง/เท็จ` for `True/False`
  - And many other control flow keywords in Thai. Check out the Piyathon language guide for details.
- **Code Formatting**: Automatic code formatting support that preserves Thai keywords while applying Python formatting standards
- **Smart Indentation**: Automatic indentation for control structures and function definitions

## Requirements

- Visual Studio Code version 1.94.0 or higher
- Python extension for VS Code (automatically installed as a dependency)
- Python version 3.12 or higher
- [`piyathon`](https://pypi.org/project/piyathon/) Python package

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Piyathon"
4. Click Install

The extension will automatically install the required Python extension if it's not already installed.

## Usage

1. Create a new file with the `.pi` extension
2. Start writing Piyathon code.
3. The extension will automatically provide syntax highlighting and formatting support.
