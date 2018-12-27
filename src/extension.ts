import * as vscode from "vscode";
import RequireDefinitionProvider from "./RequireDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("cartridge resolve extension activing");
  // Getting configuration
  const configuration = vscode.workspace.getConfiguration("require.cartridge.resolve");
  // Registering provider
  const selector = { scheme: "file", pattern: "**/*.{" + configuration.filetypes + "}" };
  const provider = new RequireDefinitionProvider(configuration);
  const registerDefinitionProvider = vscode.languages.registerDefinitionProvider(selector, provider);
  context.subscriptions.push(registerDefinitionProvider);
}

export function deactivate() {}
