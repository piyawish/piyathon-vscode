import { runTests } from "@vscode/test-electron";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = resolve(__dirname);

    // The path to the extension test script
    const extensionTestsPath = resolve(
      __dirname,
      "./test/extension.test.js"
    );

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  }
}

main();
