.PHONY: all clean install test package publish

# Default target
all: install test package

# Install dependencies
install:
	npm install

# Run tests
test:
	npm run test

# Clean build artifacts
clean:
	rm -rf out/
	rm -rf *.vsix

# Package the extension
package: clean
	npm run vsce package

# Publish the extension to VS Code Marketplace
publish: package
	npm run vsce publish

# Install extension locally for testing
install-extension: package
	code --install-extension *.vsix

# Uninstall extension locally
uninstall-extension:
	code --uninstall-extension $(shell node -p "require('./package.json').publisher").$(shell node -p "require('./package.json').name")

# Watch and compile in development mode
watch:
	npm run watch

# Lint the code
lint:
	npm run lint

# Fix linting issues automatically
lint-fix:
	npm run lint:fix