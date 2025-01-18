const vscode = require("vscode");
const { formatPiyathon } = require("./piyathonFormatter");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function findVenvPython() {
  // Common virtual environment paths relative to workspace
  const venvPaths = [
    "venv/bin/python",
    ".venv/bin/python",
    "env/bin/python",
    ".env/bin/python",
  ];

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return null;

  const workspacePath = workspaceFolders[0].uri.fsPath;

  for (const venvPath of venvPaths) {
    const fullPath = path.join(workspacePath, venvPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function activate(context) {
  let formattingProvider =
    vscode.languages.registerDocumentFormattingEditProvider(
      "piyathon",
      {
        async provideDocumentFormattingEdits(document) {
          return await formatPiyathon(document);
        },
      }
    );

  let convertCommand = vscode.commands.registerCommand(
    "piyathon.convertToPython",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      if (document.languageId !== "piyathon") {
        return;
      }

      // Save the current file first
      await document.save();

      const sourceFile = document.uri.fsPath;
      const destinationFile = sourceFile.replace(/\.pi$/, ".py");

      // Find Python in virtual environment
      const pythonPath = findVenvPython();
      if (!pythonPath) {
        vscode.window.showErrorMessage(
          "Could not find Python in virtual environment. Please make sure you have activated your virtual environment."
        );
        return;
      }

      // Get the venv bin directory where p2p is installed
      const venvBinDir = path.dirname(pythonPath);
      const p2pPath = path.join(venvBinDir, "p2p");

      // Execute p2p command from venv
      exec(
        `"${p2pPath}" "${sourceFile}" "${destinationFile}"`,
        {
          env: { ...process.env, PYTHONUNBUFFERED: "1" },
        },
        async (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
              `Error translating file: ${error.message}`
            );
            return;
          }
          if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            return;
          }

          // Open the translated Python file
          const pythonDocument =
            await vscode.workspace.openTextDocument(destinationFile);
          await vscode.window.showTextDocument(pythonDocument);
          vscode.window.showInformationMessage(
            "Successfully translated to Python!"
          );
        }
      );
    }
  );

  context.subscriptions.push(formattingProvider, convertCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
