// VS Code specific imports
let vscode;
try {
  vscode = require("vscode");
} catch {
  // Mock vscode for testing
  vscode = {};
}

// Load the keyword mappings from the JSON file
const mappings = require("./python_mappings.json");
const PI_TO_PY = mappings.PI_TO_PY;
const PY_TO_PI = mappings.PY_TO_PI;

function tokenize(code) {
  const tokens = [];
  let current = 0;
  let inString = false;
  let stringChar = "";
  let inComment = false;
  let inDocString = false;
  let docStringChar = "";
  let currentToken = "";

  while (current < code.length) {
    const char = code[current];
    const nextChar = code[current + 1];
    const nextNextChar = code[current + 2];

    // Handle docstrings
    if (
      !inString &&
      !inComment &&
      (char + nextChar + nextNextChar === '"""' ||
        char + nextChar + nextNextChar === "'''")
    ) {
      if (
        inDocString &&
        char + nextChar + nextNextChar === docStringChar
      ) {
        currentToken += char + nextChar + nextNextChar;
        tokens.push({ type: "docstring", value: currentToken });
        currentToken = "";
        inDocString = false;
        current += 3;
        continue;
      } else if (!inDocString) {
        if (currentToken) {
          tokens.push({ type: "code", value: currentToken });
          currentToken = "";
        }
        inDocString = true;
        docStringChar = char + nextChar + nextNextChar;
        currentToken = docStringChar;
        current += 3;
        continue;
      }
    }

    // Handle comments
    if (!inString && !inDocString && char === "#") {
      if (currentToken) {
        tokens.push({ type: "code", value: currentToken });
        currentToken = "";
      }
      inComment = true;
      currentToken = char;
      current++;
      continue;
    }

    // Handle strings
    if (
      !inComment &&
      !inDocString &&
      (char === '"' || char === "'")
    ) {
      if (inString && char === stringChar) {
        currentToken += char;
        tokens.push({ type: "string", value: currentToken });
        currentToken = "";
        inString = false;
      } else if (!inString) {
        if (currentToken) {
          tokens.push({ type: "code", value: currentToken });
          currentToken = "";
        }
        inString = true;
        stringChar = char;
        currentToken = char;
      } else {
        currentToken += char;
      }
      current++;
      continue;
    }

    // Handle newlines
    if (char === "\n") {
      if (inComment) {
        tokens.push({ type: "comment", value: currentToken });
        currentToken = "";
        inComment = false;
      } else if (currentToken) {
        tokens.push({
          type:
            inString || inDocString
              ? inString
                ? "string"
                : "docstring"
              : "code",
          value: currentToken,
        });
        currentToken = "";
      }
      tokens.push({ type: "newline", value: char });
      current++;
      continue;
    }

    currentToken += char;
    current++;
  }

  if (currentToken) {
    tokens.push({
      type: inString
        ? "string"
        : inComment
        ? "comment"
        : inDocString
        ? "docstring"
        : "code",
      value: currentToken,
    });
  }

  return tokens;
}

function preprocessCode(code) {
  const tokens = tokenize(code);

  const processedTokens = tokens.map((token) => {
    if (token.type === "code") {
      let processedValue = token.value;

      // Split into words while preserving whitespace and punctuation
      const parts = processedValue.split(/(\s+|[():])/);

      // Process each part
      const processedParts = parts.map((part) => {
        // Skip empty strings, whitespace, and punctuation
        if (!part.trim() || /^[():]$/.test(part)) {
          return part;
        }

        // Check if this part is a Thai keyword
        if (PI_TO_PY.hasOwnProperty(part)) {
          return PI_TO_PY[part];
        }

        return part;
      });

      return { ...token, value: processedParts.join("") };
    }
    return token;
  });

  return processedTokens.map((token) => token.value).join("");
}

function postprocessCode(code) {
  const tokens = tokenize(code);

  const processedTokens = tokens.map((token) => {
    if (token.type === "code") {
      let processedValue = token.value;

      // Split into words while preserving whitespace and punctuation
      const parts = processedValue.split(/(\s+|[():])/);

      // Process each part
      const processedParts = parts.map((part) => {
        // Skip empty strings, whitespace, and punctuation
        if (!part.trim() || /^[():]$/.test(part)) {
          return part;
        }

        // Check if this part is an English keyword
        if (PY_TO_PI.hasOwnProperty(part)) {
          return PY_TO_PI[part];
        }

        return part;
      });

      return { ...token, value: processedParts.join("") };
    }
    return token;
  });

  return processedTokens.map((token) => token.value).join("");
}

async function formatPiyathon(document) {
  const originalCode = document.getText();
  const preprocessedCode = preprocessCode(originalCode);

  try {
    // Create a temporary Python document with the preprocessed code
    const tempUri = vscode.Uri.parse(
      `untitled:${document.uri.fsPath}.py`
    );
    const tempDocument = await vscode.workspace.openTextDocument(
      tempUri
    );
    const edit = new vscode.WorkspaceEdit();
    edit.insert(tempUri, new vscode.Position(0, 0), preprocessedCode);
    await vscode.workspace.applyEdit(edit);

    // Use the Python extension's formatting command
    await vscode.commands.executeCommand(
      "python.formatting.provider",
      tempDocument
    );

    // Get the formatted code
    const formattedCode = tempDocument.getText();
    const postprocessedCode = postprocessCode(formattedCode);

    // Close the temporary document
    await vscode.workspace.fs.delete(tempUri);

    // Create a full-document TextEdit
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(originalCode.length)
    );
    return [vscode.TextEdit.replace(fullRange, postprocessedCode)];
  } catch (error) {
    console.error("Formatting failed:", error);
    vscode.window.showErrorMessage(
      `Piyathon formatting failed: ${error.message}`
    );
    return [];
  }
}

module.exports = { formatPiyathon, preprocessCode, postprocessCode };
