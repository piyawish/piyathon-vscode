const path = require("path");
const Mocha = require("mocha");
const { glob } = require("glob");

async function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 20000, // Increased timeout for VS Code operations
  });

  const testsRoot = path.resolve(__dirname);
  try {
    // Use await with glob since it returns a Promise now
    const files = await glob("*.test.js", { cwd: testsRoot });

    // Add files to the test suite
    files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

    // Return a new Promise for the mocha run
    return new Promise((resolve, reject) => {
      try {
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.error("Error loading test files:", err);
    throw err;
  }
}

module.exports = {
  run,
};
