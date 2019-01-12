import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const CARTRIDGE_DEFAULT_FOLDER = "cartridge";

export interface ExtensionConfig {
  scriptFiletypes?: string;
  templateFiletypes?: string;
}

export interface DefinitionConfig {
  wordRangeRegex?: RegExp; // Regex to identify the require cartridge module statement text
  identifyRegex?: RegExp; // Regex to identify a require cartridge text line
  identifyMatchPathPosition?: number; // Match position for the require path declared in identifyRegex
  identifyType?: string; // require cartridge identification type
  cartridgeFolder?: string; // text literal used for cartridge path resolution
  symbolWordRangeRegex?: RegExp; // Regex to identify a symbol statement text
  symbolIdentifyRegex?: RegExp; // Regex to identify a symbol that can need a require cartridge reference
  symbolIdentifyMatchPathPosition?: number; // Match position for the symbol declared in symbolIdentifyRegex
  symbolIdentifyType?: string; // symbol identification type
}

export interface DefinitionItem {
  lineText?: string; // line text where reference to a cartridge module is required.
  statement?: string; // require cartridge module statement text.
  path?: string; // declared path in require statement.
  type?: string; // require cartridge module declaration type.
  documentFileName?: string; // current document file name.
  filePaths?: string[]; // resolved require cartridge module file paths.
  range?: vscode.Range; // defined range for require.
  symbolStatement?: string; // symbol statement text.
  symbolReferenceName?: string; // Name of the variable that contains the require module reference of the symbol.
  symbolElementName?: string; // Name of the property, function, ... to symbol definition.
}

interface DefinitionStore {
  definitionItem?: DefinitionItem;
  provideDefinition?: vscode.DefinitionLink[];
  provideHover?: vscode.Hover;
}

interface ProviderResult {
  documentFileName: string;
  positionLine: number;
  result: any;
}

export default abstract class BaseDefinitionProvider implements vscode.DefinitionProvider, vscode.HoverProvider {
  protected _extensionConfig: ExtensionConfig = {};
  protected _definitionConfig: DefinitionConfig = {
    symbolWordRangeRegex: /([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/,
    symbolIdentifyRegex: /.+/,
    symbolIdentifyMatchPathPosition: 0,
    cartridgeFolder: CARTRIDGE_DEFAULT_FOLDER
  };
  protected _lastStore: DefinitionStore = {
    definitionItem: null,
    provideDefinition: null,
    provideHover: null
  };

  public constructor(extensionConfig = {}, definitionConfig = {}) {
    this._extensionConfig = Object.assign(this._extensionConfig, extensionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, definitionConfig);
  }

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.DefinitionLink[]> {
    let result = [];
    const providerResult = this.getProviderResultFromStore(document, position, "provideDefinition");
    if (providerResult) {
      result = providerResult.result;
    } else {
      const definitionItem = await this.findCartridgeDefinitionItem(document, position);
      if (definitionItem && definitionItem.filePaths) {
        definitionItem.filePaths.forEach(filePath => {
          result.push({
            originSelectionRange: definitionItem.range,
            targetUri: vscode.Uri.file(filePath),
            targetRange: new vscode.Range(0, 0, 0, 0)
          } as vscode.DefinitionLink);
        });
      } else {
        const symbolDefinitionItem = await this.findSymbolDefinitionItem(document, position);
        if (symbolDefinitionItem && symbolDefinitionItem.filePaths) {
          symbolDefinitionItem.filePaths.forEach(filePath => {
            result.push({
              originSelectionRange: symbolDefinitionItem.range,
              targetUri: vscode.Uri.file(filePath),
              targetRange: new vscode.Range(0, 0, 0, 0)
            } as vscode.DefinitionLink);
          });
        }
      }
      this.storeProviderResult(document, position, "provideDefinition", result);
    }
    return result;
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover> {
    let result = null;
    const providerResult = this.getProviderResultFromStore(document, position, "provideHover");
    if (providerResult) {
      result = providerResult.result;
    } else {
      const definitionItem = await this.findCartridgeDefinitionItem(document, position);
      if (definitionItem && definitionItem.filePaths) {
        result = this.createDefinitionHover(definitionItem, "definitions");
      } else {
        const symbolDefinitionItem = await this.findSymbolDefinitionItem(document, position);
        if (symbolDefinitionItem && symbolDefinitionItem.filePaths) {
          result = this.createDefinitionHover(symbolDefinitionItem, "symbol definitions");
        }
      }
      this.storeProviderResult(document, position, "provideHover", result);
    }
    return result;
  }

  private createDefinitionHover(definitionItem: DefinitionItem, definitionTypeText: string): vscode.Hover {
    let content = "``` js";
    if (definitionItem.filePaths.length > 0) {
      content += "\nϞϞ(๑⚈‿‿⚈๑)∩ - " + definitionTypeText;
      definitionItem.filePaths.forEach(filePath => {
        content += '\n"' + filePath + '"';
      });
    } else {
      content += "\nϞϞ(๑⊙__☉๑)∩ - no " + definitionTypeText;
    }
    content += "```";
    return new vscode.Hover(content, definitionItem.range);
  }

  protected async findCartridgeDefinitionItem(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<DefinitionItem> {
    let result = null;
    try {
      let range = document.getWordRangeAtPosition(position, this._definitionConfig.wordRangeRegex);
      if (range && !range.isEmpty) {
        const lineText = document.lineAt(position.line).text;
        result = this.getDefinitionItemResultFromStore(lineText, document.fileName);
        if (!result) {
          let definitionItem = await this.identifyDefinitionItem(lineText);
          result = await this.processDefinitionItem(definitionItem, document, range);
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  protected async findSymbolDefinitionItem(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<DefinitionItem> {
    let result = null;
    try {
      let range = document.getWordRangeAtPosition(position, this._definitionConfig.symbolWordRangeRegex);
      if (range && !range.isEmpty) {
        const symbolStatement = document.getText(range);
        const lineText = document.lineAt(position.line).text;
        result = this.getDefinitionItemResultFromStore(lineText, document.fileName);
        if (!result) {
          let definitionItem = await this.identifySymbolDefinitionProvider(position, document, symbolStatement);
          result = await this.processDefinitionItem(definitionItem, document, range);
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  private async identifySymbolDefinitionProvider(
    position: vscode.Position,
    document: vscode.TextDocument,
    symbolStatement: string
  ): Promise<DefinitionItem> {
    var symbolDefinitionItem: DefinitionItem = null;
    let positionLine = position.line;
    const referenceName = symbolStatement.substring(0, symbolStatement.indexOf("."));
    while (!symbolDefinitionItem && positionLine >= 0) {
      const definitionItem = await this.identifyDefinitionItem(document.lineAt(positionLine).text);
      if (definitionItem && definitionItem.lineText.includes(referenceName)) {
        symbolDefinitionItem = definitionItem;
        symbolDefinitionItem.symbolStatement = symbolStatement;
        symbolDefinitionItem.symbolReferenceName = referenceName;
        symbolDefinitionItem.symbolElementName = symbolStatement.substring(symbolStatement.indexOf(".") + 1);
      }
      positionLine = positionLine - 1;
    }
    if (!symbolDefinitionItem) {
      console.log(
        "Require statement reference name " + referenceName + " not found. Ignoring symbol statement " + symbolStatement
      );
    }
    return symbolDefinitionItem;
  }

  private async processDefinitionItem(
    definitionItem: any,
    document: vscode.TextDocument,
    range: vscode.Range
  ): Promise<DefinitionItem> {
    let result = null;
    if (definitionItem) {
      console.log("Processing " + definitionItem.type + " statement " + definitionItem.statement);
      definitionItem.documentFileName = document.fileName;
      // Check if file exists on current cartridge
      let filePaths = [];
      const filePath = await this.resolveCurrentCartridgeFilePath(definitionItem);
      if (filePath) {
        filePaths.push(filePath);
      } else {
        // Trying to find file on workspace cartridges
        filePaths = await this.findCartridgeHierachyFilePaths(definitionItem);
      }
      if (filePaths) {
        console.log("Resolved require file paths: " + filePaths);
        result = this.storeDefinitionItem(definitionItem, filePaths, range);
      }
    }
    return result;
  }

  protected identifyDefinitionItem(lineText: string): Promise<DefinitionItem> {
    const config = this._definitionConfig;
    return new Promise((resolve, reject) => {
      let result = null;

      let match = config.identifyRegex.exec(lineText);
      if (match && match.length >= config.identifyMatchPathPosition) {
        result = {
          lineText: lineText,
          statement: match[0],
          path: match[config.identifyMatchPathPosition - 1],
          type: config.identifyType
        };
      }

      resolve(result);
    });
  }

  protected resolveCurrentCartridgeFilePath(definitionItem: DefinitionItem): Promise<string> {
    if (definitionItem && definitionItem.path) {
      const cartridgeFolder = this._definitionConfig.cartridgeFolder;
      return new Promise((resolve, reject) => {
        try {
          // Create file path
          const fileName = definitionItem.documentFileName;
          let initialPath = fileName.substring(0, fileName.indexOf(cartridgeFolder + path.sep));
          if (!initialPath || initialPath === "") {
            initialPath = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri.fsPath;
          }
          let filePath = this.normalizePath(
            initialPath + cartridgeFolder + definitionItem.path + this.resolveExtension(definitionItem)
          );
          // Check if file path exists
          fs.stat(filePath, (error, stat) => {
            let resolvedFilePath = null;
            if (!error) {
              resolvedFilePath = filePath;
            }
            return resolve(resolvedFilePath);
          });
        } catch (error) {
          console.log("resolveCurrentCartridgeFilePath: " + error);
          return resolve(null);
        }
      });
    } else {
      return Promise.reject("resolveCurrentCartridgeFilePath: File path is undefined");
    }
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    if (definitionItem && definitionItem.path) {
      const cartridgeFolder = this._definitionConfig.cartridgeFolder;
      return new Promise((resolve, reject) => {
        try {
          const includePattern = this.normalizePath(
            "**/" + cartridgeFolder + "/**" + definitionItem.path + this.resolveExtension(definitionItem)
          );
          vscode.workspace.findFiles(includePattern, "**/node_modules/**").then(files => {
            let resolvedFilePaths: string[] = [];
            if (files && files.length > 0) {
              files.forEach(file => {
                if (file.fsPath !== definitionItem.documentFileName) {
                  // Include all files except current document
                  resolvedFilePaths.push(this.normalizePath(file.fsPath));
                }
              });
            }
            return resolve(resolvedFilePaths);
          });
        } catch (error) {
          console.log("findCartridgeHierachyFilePaths: " + error);
          return resolve(null);
        }
      });
    } else {
      return Promise.reject("findCartridgeHierachyFilePaths: File path is undefined");
    }
  }

  protected resolveExtension(definitionItem: DefinitionItem): string {
    const documentFileName = definitionItem.documentFileName;
    const addExtension = definitionItem.path.indexOf(".") <= 0;
    return addExtension ? documentFileName.substring(documentFileName.lastIndexOf(".")) : "";
  }

  protected normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
  }

  protected getDefinitionItemResultFromStore(lineText, documentFileName): DefinitionItem {
    const lastDefinitionItem = this._lastStore.definitionItem;
    if (
      lastDefinitionItem &&
      lastDefinitionItem.lineText === lineText &&
      lastDefinitionItem.documentFileName === documentFileName
    ) {
      console.log('From store cartridge path "' + lastDefinitionItem.path + '"');
      return lastDefinitionItem;
    }
    return null;
  }

  protected storeDefinitionItem(
    definitionItem: DefinitionItem,
    filePaths: string[],
    range: vscode.Range
  ): DefinitionItem {
    definitionItem.filePaths = filePaths;
    definitionItem.range = range;
    this._lastStore.definitionItem = definitionItem;
    return definitionItem;
  }

  protected getProviderResultFromStore(
    document: vscode.TextDocument,
    position: vscode.Position,
    type: string
  ): ProviderResult {
    const lastProviderResult: ProviderResult = this._lastStore[type];
    if (
      lastProviderResult &&
      lastProviderResult.documentFileName === document.fileName &&
      lastProviderResult.positionLine === position.line
    ) {
      console.log('From store provider result "' + lastProviderResult.result + '"');
      return lastProviderResult;
    }
    return null;
  }

  protected storeProviderResult(
    document: vscode.TextDocument,
    position: vscode.Position,
    type: string,
    result: any
  ): ProviderResult {
    const providerResult: ProviderResult = {
      documentFileName: document.fileName,
      positionLine: position.line,
      result: result
    };
    this._lastStore[type] = providerResult;
    return providerResult;
  }

  dispose() {
    // Nothing to do here;
  }
}
