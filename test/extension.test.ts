import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

suite("Extension Tests", () => {
    test("Extension should be available", () => {
        assert.ok(myExtension, "Extension not available!");
    });

    test('Example workspace test files should be resolved', async () => {
      const testFiles = await vscode.workspace.findFiles("**/cartridge/**/*.js", "**/node_modules/**");
      if (testFiles && testFiles.length > 0) {
        testFiles.forEach(async (testFile) => {
          const testDocument = await vscode.workspace.openTextDocument(testFile);
          await vscode.window.showTextDocument(testDocument);
          // TODO: test TEST: marks
        });
      }
    });
});
