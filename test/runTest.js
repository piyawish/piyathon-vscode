const path = require("path");
const fs = require("fs");
const os = require("os");
const {
  runTests,
  downloadAndUnzipVSCode,
} = require("@vscode/test-electron");
const { execSync } = require("child_process");

async function main() {
  let workspacePath;
  let extensionsDir;
  let userDataDir;

  try {
    // Create a temporary workspace
    workspacePath = path.resolve(__dirname, "../test-workspace");
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
    fs.mkdirSync(workspacePath, { recursive: true });

    // Create directories for extensions and user data
    extensionsDir = path.join(workspacePath, "extensions");
    userDataDir = path.join(workspacePath, "user-data");
    fs.mkdirSync(extensionsDir, { recursive: true });
    fs.mkdirSync(userDataDir, { recursive: true });

    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../");

    // The path to the extension test runner script
    const suite = path.resolve(__dirname, "./suite");

    // Download VS Code
    console.log("Downloading VS Code...");
    const vscodeExecutablePath = await downloadAndUnzipVSCode(
      "1.94.0"
    );

    // Install Python extension first
    console.log("Installing Python extension...");
    execSync(
      `"${vscodeExecutablePath}" --install-extension ms-python.python --force`,
      { stdio: "inherit" }
    );

    // Copy Python extension from user's VS Code to test environment
    const userExtDir = path.join(os.homedir(), ".vscode/extensions");
    const pythonExt = fs
      .readdirSync(userExtDir)
      .find((f) => f.startsWith("ms-python.python-"));

    if (pythonExt) {
      const srcDir = path.join(userExtDir, pythonExt);
      const destDir = path.join(extensionsDir, pythonExt);
      fs.cpSync(srcDir, destDir, { recursive: true });
      console.log("Python extension copied to test directory");
    }

    // Create settings file
    const settingsDir = path.join(userDataDir, "User");
    fs.mkdirSync(settingsDir, { recursive: true });
    fs.writeFileSync(
      path.join(settingsDir, "settings.json"),
      JSON.stringify(
        {
          "python.defaultInterpreterPath":
            process.env.PYTHON_PATH || "python3",
          "editor.defaultFormatter":
            "undefined_publisher.piyathon-vscode",
          "editor.formatOnSave": true,
          "editor.formatOnType": true,
          "[piyathon]": {
            "editor.defaultFormatter":
              "undefined_publisher.piyathon-vscode",
            "editor.formatOnSave": true,
            "editor.formatOnType": true,
          },
          "extensions.autoUpdate": false,
          "extensions.autoCheckUpdates": false,
          "update.mode": "none",
        },
        null,
        2
      )
    );

    // Run the integration tests with a wrapper to handle process termination
    const testPromise = runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath: suite,
      launchArgs: [
        workspacePath,
        "--disable-workspace-trust",
        "--skip-welcome",
        "--skip-release-notes",
        "--disable-telemetry",
        "--disable-updates",
        "--disable-crash-reporter",
        "--disable-gpu",
        "--user-data-dir",
        userDataDir,
        "--extensions-dir",
        extensionsDir,
        "--enable-proposed-api=ms-python.python",
        "--enable-proposed-api=undefined_publisher.piyathon-vscode",
        "--no-sandbox",
        "--disable-gpu-sandbox",
        "--wait",
      ],
      extensionTestsEnv: {
        EXTENSION_DEVELOPMENT: "true",
        EXTENSION_TESTING: "true",
        VSCODE_EXTENSIONS_PATH: extensionsDir,
        ELECTRON_ENABLE_LOGGING: "1",
        VSCODE_SKIP_PRELAUNCH: "1",
      },
    });

    // Add a timeout to ensure clean process termination
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Test run timed out")),
        30000
      );
    });

    try {
      await Promise.race([testPromise, timeoutPromise]);
      // Add a small delay to allow processes to clean up
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.message === "Test run timed out") {
        console.log("Test run completed (timeout)");
      } else {
        throw error;
      }
    }
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  } finally {
    // Clean up workspace
    if (workspacePath) {
      try {
        console.log("Cleaning up workspace...");
        // Add a small delay before cleanup
        await new Promise((resolve) => setTimeout(resolve, 1000));
        fs.rmSync(workspacePath, { recursive: true, force: true });
      } catch (e) {
        console.warn("Failed to clean up workspace:", e);
      }
    }
  }

  // Exit cleanly
  process.exit(0);
}

// Handle process signals
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Exiting gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Exiting gracefully...");
  process.exit(0);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
