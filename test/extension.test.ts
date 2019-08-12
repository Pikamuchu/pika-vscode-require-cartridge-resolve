//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

suite("Extension Tests", () => {
    test("extension should be available", () => {
        assert.ok(myExtension, "Extension not available!");
    });
    test('open order controller file', async () => {
      const exampleWorkspace = './example-workspace/project2/cartridges/extension/cartridge/controllers/Order.js';
      const exampleWorkspaceUri = vscode.Uri.file(exampleWorkspace);
      const orderControllerFile = './example-workspace/project2/cartridges/extension/cartridge/controllers/Order.js';
  
      await vscode.commands.executeCommand('vscode.openFolder', exampleWorkspaceUri);
      const doc = await vscode.workspace.openTextDocument(orderControllerFile);
      await vscode.window.showTextDocument(doc);
    });
});
