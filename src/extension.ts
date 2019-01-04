import * as vscode from "vscode";
import RequireDefinitionProvider from "./RequireDefinitionProvider";
import SuperModuleDefinitionProvider from "./SuperModuleDefinitionProvider";
import RequireClientDefinitionProvider from "./RequireClientDefinitionProvider";
import RequireDwDefinitionProvider from "./RequireDwDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("cartridge resolve extension activing");
  // Getting configuration
  const configuration = vscode.workspace.getConfiguration("require.cartridge.resolve");
  const defaultSelector = {
    scheme: "file",
    pattern: "**/*.{" + configuration.scriptFiletypes + "," + configuration.templateFiletypes + "}"
  };

  // Registering require definition provider
  const requireProvider = new RequireDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireProvider));
  // Registering superModule definition provider
  const superModuleProvider = new SuperModuleDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, superModuleProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, superModuleProvider));
  // Registering requireClient definition provider
  const requireClientProvider = new RequireClientDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireClientProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireClientProvider));
  // Registering requireDw definition provider
  const requireDwProvider = new RequireDwDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireDwProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireDwProvider));
}

export function deactivate() {}
