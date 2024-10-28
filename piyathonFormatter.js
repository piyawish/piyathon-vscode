const vscode = require("vscode");

// Thai to English keyword map (same as before)
const keywordMap = {
  ถ้า: "if",
  มิฉะนั้น: "else",
  // ... (other keywords)
};

function preprocessCode(code) {
  let processedCode = code;
  for (const [thai, english] of Object.entries(keywordMap)) {
    const regex = new RegExp(`\\b${thai}\\b`, "g");
    processedCode = processedCode.replace(regex, english);
  }
  return processedCode;
}

function postprocessCode(code) {
  let processedCode = code;
  for (const [thai, english] of Object.entries(keywordMap)) {
    const regex = new RegExp(`\\b${english}\\b`, "g");
    processedCode = processedCode.replace(regex, thai);
  }
  return processedCode;
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

module.exports = { formatPiyathon };
