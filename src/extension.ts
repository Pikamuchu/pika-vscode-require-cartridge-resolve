import * as vscode from "vscode";
import RequireDefinitionProvider from "./RequireDefinitionProvider";
import SuperModuleDefinitionProvider from "./SuperModuleDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("cartridge resolve extension activing");
  // Getting configuration
  const configuration = vscode.workspace.getConfiguration("require.cartridge.resolve");
  const selector = { scheme: "file", pattern: "**/*.{" + configuration.filetypes + "}" };
  // Registering require definition provider
  const requireProvider = new RequireDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, requireProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(selector, requireProvider));
  // Registering superModule definition provider
  const superModuleProvider = new SuperModuleDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, superModuleProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(selector, superModuleProvider));
}

export function deactivate() {}
