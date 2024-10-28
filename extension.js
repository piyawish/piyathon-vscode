const vscode = require("vscode");
const { formatPiyathon } = require("./src/piyathonFormatter");

function activate(context) {
  let disposable =
    vscode.languages.registerDocumentFormattingEditProvider(
      "piyathon",
      {
        async provideDocumentFormattingEdits(document) {
          return await formatPiyathon(document);
        },
      }
    );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
