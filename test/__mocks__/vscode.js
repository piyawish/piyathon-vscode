module.exports = {
  Uri: {
    parse: jest.fn(),
  },
  Range: jest.fn(),
  Position: jest.fn(),
  WorkspaceEdit: jest.fn(),
  TextEdit: {
    replace: jest.fn(),
  },
  workspace: {
    openTextDocument: jest.fn(),
    applyEdit: jest.fn(),
    fs: {
      delete: jest.fn(),
    },
  },
  window: {
    showErrorMessage: jest.fn(),
  },
  commands: {
    executeCommand: jest.fn(),
  },
};
