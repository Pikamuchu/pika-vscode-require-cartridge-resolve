import * as vscode from 'vscode';
import RequireDefinitionProvider from './RequireDefinitionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('cartridge resolve extension activing');
    const configuration = vscode.workspace.getConfiguration('require.cartridge.resolve');
    const definitionProvider = new RequireDefinitionProvider(configuration);
    const registerDefinitionProvider = vscode.languages.registerDefinitionProvider({ scheme: 'file', pattern: '**/*.{js,ts}' }, definitionProvider);
    context.subscriptions.push(registerDefinitionProvider);
}

export function deactivate() {}
