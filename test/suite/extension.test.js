const vscode = require("vscode");
const path = require("path");
const assert = require("assert");
const {
  preprocessCode,
  postprocessCode,
} = require("../../piyathonFormatter");

function formatCode(code) {
  // First preprocess to handle Thai keywords
  const preprocessed = preprocessCode(code);

  // Split into lines for processing
  const lines = preprocessed.split("\n");
  const formattedLines = [];
  let baseIndentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      formattedLines.push("");
      continue;
    }

    // Handle comments at the start of line
    if (trimmedLine.startsWith("#")) {
      formattedLines.push(trimmedLine);
      continue;
    }

    // Handle docstrings
    if (
      trimmedLine.startsWith('"""') ||
      trimmedLine.startsWith("'''")
    ) {
      const indent = "    ".repeat(baseIndentLevel);
      formattedLines.push(indent + trimmedLine);
      continue;
    }

    // Split line into code and comment
    const [codePart, ...commentParts] = trimmedLine.split("#");
    const comment = commentParts.length
      ? "#" + commentParts.join("#")
      : "";

    // Format the code part
    let formattedCode = codePart
      .trim()
      .replace(/\s*([(),])\s*/g, "$1")
      .replace(/\s*:\s*/g, ":")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s+/g, " ")
      .trim();

    // Calculate indentation
    if (formattedCode.endsWith(":")) {
      const indent = "    ".repeat(baseIndentLevel);
      formattedLines.push(
        indent + formattedCode + (comment ? "  " + comment : "")
      );
      baseIndentLevel++;
    } else {
      // Check for dedent
      if (i > 0) {
        const currentIndent = line.match(/^\s*/)[0].length;
        const prevIndent = lines[i - 1].match(/^\s*/)[0].length;
        if (currentIndent < prevIndent) {
          baseIndentLevel = Math.floor(currentIndent / 4);
        }
      }
      const indent = "    ".repeat(baseIndentLevel);
      formattedLines.push(
        indent + formattedCode + (comment ? "  " + comment : "")
      );
    }
  }

  // Convert back to Thai
  return postprocessCode(formattedLines.join("\n"));
}

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
        if (currentToken)
          tokens.push({ type: "code", value: currentToken });
        currentToken = "";
        inDocString = true;
        docStringChar = char + nextChar + nextNextChar;
        currentToken = char + nextChar + nextNextChar;
        current += 3;
        continue;
      }
    }

    // Handle comments
    if (!inString && !inDocString && char === "#") {
      if (currentToken)
        tokens.push({ type: "code", value: currentToken });
      currentToken = "";
      inComment = true;
    }

    // Handle newlines
    if (char === "\n") {
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
        currentToken = "";
      }
      tokens.push({ type: "newline", value: char });
      inComment = false;
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

function formatLine(line) {
  // Split the line into code and comment parts
  const commentMatch = line.match(/(.*?)(#.*)?$/);
  const code = commentMatch[1] || "";
  const comment = commentMatch[2] || "";

  // Format the code part
  let formattedCode = code
    .trim()
    .replace(/\s*([(),])\s*/g, "$1") // Remove spaces around punctuation except colon
    .replace(/\s*:\s*/g, ":") // Remove spaces around colon
    .replace(/\(\s+/g, "(") // Remove space after opening parenthesis
    .replace(/\s+\)/g, ")") // Remove space before closing parenthesis
    .replace(/\s*=\s*/g, " = ") // Add single space around equals
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  // Add back the comment with proper spacing
  if (comment) {
    formattedCode += "  " + comment; // Two spaces before comment
  }

  return formattedCode;
}

suite("Piyathon Extension", () => {
  suiteSetup(async function () {
    this.timeout(60000);
    console.log("Setting up test suite...");
  });

  test("should format Piyathon file correctly", async function () {
    this.timeout(30000);

    const testContent = `ถ้า x > 0:
        พิมพ์ ( "Hello" )  # Badly formatted code
    สำหรับ i ใน ช่วง(10):
          พิมพ์(i)`;

    const expectedContent = `ถ้า x > 0:
    พิมพ์("Hello")  # Badly formatted code
    สำหรับ i ใน ช่วง(10):
        พิมพ์(i)`;

    // Create a temporary file in the workspace
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const filePath = path.join(workspaceFolder.uri.fsPath, "test.pi");
    const uri = vscode.Uri.file(filePath);

    try {
      // Write the test content
      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(testContent)
      );

      // Open the document
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);

      // Format using our formatter
      const formattedContent = formatCode(testContent);

      // Apply the formatting
      const edit = new vscode.WorkspaceEdit();
      const range = new vscode.Range(
        document.positionAt(0),
        document.positionAt(testContent.length)
      );
      edit.replace(uri, range, formattedContent);
      await vscode.workspace.applyEdit(edit);

      // Get the formatted content
      const resultContent = document.getText();

      // Assert the result
      assert.strictEqual(resultContent, expectedContent);
    } finally {
      // Clean up
      try {
        await vscode.workspace.fs.delete(uri);
      } catch (e) {
        console.error("Failed to clean up test file:", e);
      }
    }
  });

  test("should handle comments and strings correctly", async function () {
    this.timeout(30000);

    const testContent = `# ถ้า condition is true
ถ้า x > 0:  # ถ้า comment
    พิมพ์ ( "ถ้า in string" )
    """
    ถ้า in docstring
    multiple lines
    """
    y  =  จริง  และ  เท็จ`;

    const expectedContent = `# ถ้า condition is true
ถ้า x > 0:  # ถ้า comment
    พิมพ์("ถ้า in string")
    """
    ถ้า in docstring
    multiple lines
    """
    y = จริง และ เท็จ`;

    // Create a temporary file in the workspace
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const filePath = path.join(workspaceFolder.uri.fsPath, "test.pi");
    const uri = vscode.Uri.file(filePath);

    try {
      // Write the test content
      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(testContent)
      );

      // Open the document
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);

      // Format using our formatter
      const formattedContent = formatCode(testContent);

      // Apply the formatting
      const edit = new vscode.WorkspaceEdit();
      const range = new vscode.Range(
        document.positionAt(0),
        document.positionAt(testContent.length)
      );
      edit.replace(uri, range, formattedContent);
      await vscode.workspace.applyEdit(edit);

      // Get the formatted content
      const resultContent = document.getText();

      // Assert the result
      assert.strictEqual(resultContent, expectedContent);
    } finally {
      // Clean up
      try {
        await vscode.workspace.fs.delete(uri);
      } catch (e) {
        console.error("Failed to clean up test file:", e);
      }
    }
  });
});
