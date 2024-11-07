const vscode = require("vscode");
const path = require("path");
const assert = require("assert");
const { before } = require("mocha");

const { runTests } = require("@vscode/test-electron");
const { suite, test } = require("mocha");

suite("Piyathon Extension", () => {
  before(async () => {
    // Wait for the extension to activate
    const ext = vscode.extensions.getExtension("piyathon-vscode");
    if (ext) {
      await ext.activate();
    } else {
      throw new Error("Extension not found");
    }
  });

  test("should format Piyathon file correctly", async function () {
    this.timeout(10000); // Increase timeout for VS Code operations

    // Create a test file
    const testContent = `ถ้า x > 0:
        พิมพ์ ( "Hello" )  # Badly formatted code
    สำหรับ i ใน ช่วง(10):
          พิมพ์(i)`;

    const expectedContent = `ถ้า x > 0:
    พิมพ์("Hello")  # Badly formatted code
    สำหรับ i ใน ช่วง(10):
        พิมพ์(i)`;

    // Create a temporary file
    const workspaceEdit = new vscode.WorkspaceEdit();
    const uri = vscode.Uri.file(path.join(__dirname, "test.pi"));
    workspaceEdit.createFile(uri, { overwrite: true });
    await vscode.workspace.applyEdit(workspaceEdit);

    // Insert the test content
    const document = await vscode.workspace.openTextDocument(uri);
    const edit = new vscode.WorkspaceEdit();
    edit.insert(uri, new vscode.Position(0, 0), testContent);
    await vscode.workspace.applyEdit(edit);

    // Format the document
    await vscode.commands.executeCommand(
      "editor.action.formatDocument"
    );

    // Get the formatted content
    const formattedContent = document.getText();

    // Clean up
    const deleteEdit = new vscode.WorkspaceEdit();
    deleteEdit.deleteFile(uri, { recursive: true });
    await vscode.workspace.applyEdit(deleteEdit);

    // Assert the result
    assert.strictEqual(formattedContent, expectedContent);
  });

  test("should handle comments and strings correctly", async function () {
    this.timeout(10000); // Increase timeout for VS Code operations

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

    // Create a temporary file
    const workspaceEdit = new vscode.WorkspaceEdit();
    const uri = vscode.Uri.file(path.join(__dirname, "test.pi"));
    workspaceEdit.createFile(uri, { overwrite: true });
    await vscode.workspace.applyEdit(workspaceEdit);

    // Insert the test content
    const document = await vscode.workspace.openTextDocument(uri);
    const edit = new vscode.WorkspaceEdit();
    edit.insert(uri, new vscode.Position(0, 0), testContent);
    await vscode.workspace.applyEdit(edit);

    // Format the document
    await vscode.commands.executeCommand(
      "editor.action.formatDocument"
    );

    // Get the formatted content
    const formattedContent = document.getText();

    // Clean up
    const deleteEdit = new vscode.WorkspaceEdit();
    deleteEdit.deleteFile(uri, { recursive: true });
    await vscode.workspace.applyEdit(deleteEdit);

    // Assert the result
    assert.strictEqual(formattedContent, expectedContent);
  });
});
