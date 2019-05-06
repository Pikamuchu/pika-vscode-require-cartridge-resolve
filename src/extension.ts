import * as vscode from "vscode";
import RequireDefinitionProvider from "./RequireDefinitionProvider";
import SuperModuleDefinitionProvider from "./SuperModuleDefinitionProvider";
import RequireClientDefinitionProvider from "./RequireClientDefinitionProvider";
import RequireDwDefinitionProvider from "./RequireDwDefinitionProvider";
import JSDocDwDefinitionProvider from "./JSDocDwDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("cartridge resolve extension activing");
  // Getting configuration
  const configuration = vscode.workspace.getConfiguration("require.cartridge.resolve");
  const defaultSelector = {
    scheme: "file",
    pattern: "**/*.{" + configuration.scriptFiletypes + "," + configuration.templateFiletypes + "}"
  };
  const triggerCharacters = ['.'];
  // Registering require definition provider
  const requireProvider = new RequireDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireProvider));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(defaultSelector, requireProvider, ...triggerCharacters));
  // Registering superModule definition provider
  const superModuleProvider = new SuperModuleDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, superModuleProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, superModuleProvider));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(defaultSelector, superModuleProvider, ...triggerCharacters));
  // Registering requireClient definition provider
  const requireClientProvider = new RequireClientDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireClientProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireClientProvider));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(defaultSelector, requireClientProvider, ...triggerCharacters));
  // Registering requireDw definition provider
  const requireDwProvider = new RequireDwDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, requireDwProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, requireDwProvider));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(defaultSelector, requireDwProvider, ...triggerCharacters));
  // Registering requireDw definition provider
  const jsDocDwProvider = new JSDocDwDefinitionProvider(configuration);
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(defaultSelector, jsDocDwProvider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(defaultSelector, jsDocDwProvider));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(defaultSelector, jsDocDwProvider, ...triggerCharacters));
}

export function deactivate() {}
