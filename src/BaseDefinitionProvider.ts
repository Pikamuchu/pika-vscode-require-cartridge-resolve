import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const CARTRIDGE_DEFAULT_FOLDER = "cartridge";
const SYMBOL_DEFINITION_TYPE_TEXT = "symbol definitions";
const DEFINITION_TYPE_TEXT = "definitions";
const PROVIDE_DEFINITION_TYPE = "provideDefinition";
const PROVIDE_HOVER_TYPE = "provideHover";

export interface ExtensionConfig {
  scriptFiletypes?: string;
  templateFiletypes?: string;
  enableDebug?: boolean;
  storeTimeout?: number;
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
  symbolElementDefinitionRegexTemplate?: string; // Template to create a RegExp for symbol element definition identification
}

export interface DefinitionItem {
  lineText?: string; // line text where reference to a cartridge module is required.
  statement?: string; // require cartridge module statement text.
  path?: string; // declared path in require statement.
  range?: vscode.Range; // defined range for require.
  type?: string; // require cartridge module declaration type.
  documentFileName?: string; // current document file name.
  symbolStatement?: string; // symbol statement text.
  symbolReferenceName?: string; // Name of the variable that contains the require module reference of the symbol.
  symbolElementName?: string; // Name of the property, function, ... to symbol definition.
  resolvedLocations?: ResolvedLocation[]; // resolved location for require cartridge module.
}

export interface ResolvedLocation {
  filePath?: string;
  positionLine?: number;
}

interface DefinitionStore {
  definitionItem?: DefinitionItem; // Item with resolved cartridge definition info, used for generate provider results.
  provideDefinition?: ProviderResult; // Result for definition provider
  provideHover?: ProviderResult; // Result for hover provider
  modifiedTime?: number; // Store modification timestamp
}

interface ProviderResult {
  documentFileName: string;
  positionLine: number;
  result: any;
}

export default abstract class BaseDefinitionProvider implements vscode.DefinitionProvider, vscode.HoverProvider {
  protected _providerClass = "DefinitionProvider";
  protected _extensionConfig: ExtensionConfig = {
    enableDebug: false,
    storeTimeout: 5000
  };
  protected _definitionConfig: DefinitionConfig = {
    symbolWordRangeRegex: /([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/,
    symbolIdentifyRegex: /.+/,
    symbolIdentifyMatchPathPosition: 0,
    symbolElementDefinitionRegexTemplate: "(export)?\\s*(function|static)\\s*({symbolElementName})\\s*((.*))?",
    cartridgeFolder: CARTRIDGE_DEFAULT_FOLDER
  };
  protected _lastStore: DefinitionStore = {
    definitionItem: null,
    provideDefinition: null,
    provideHover: null,
    modifiedTime: 0
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
    const startTime = this.logProviderStart(this._providerClass + "-definition");
    const providerResult = this.getProviderResultFromStore(document, position, PROVIDE_DEFINITION_TYPE);
    if (providerResult) {
      result = providerResult.result;
    } else {
      result = await this.performProvideDefinition(document, position);
      this.storeProviderResult(document, position, PROVIDE_DEFINITION_TYPE, result);
    }
    this.logProviderEnd(this._providerClass + "-definition", result, startTime);
    return result;
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover> {
    let result = null;
    const startTime = this.logProviderStart(this._providerClass + "-hover");
    const providerResult = this.getProviderResultFromStore(document, position, PROVIDE_HOVER_TYPE);
    if (providerResult) {
      result = providerResult.result;
    } else {
      result = await this.performProvideHover(document, position);
      this.storeProviderResult(document, position, PROVIDE_HOVER_TYPE, result);
    }
    this.logProviderEnd(this._providerClass + "-hover", result, startTime);
    return result;
  }

  private async performProvideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.DefinitionLink[]> {
    let result = [];
    const definitionItem = await this.findCartridgeDefinitionItem(document, position);
    if (definitionItem && definitionItem.resolvedLocations) {
      definitionItem.resolvedLocations.forEach(resolvedLocation => {
        result.push({
          originSelectionRange: definitionItem.range,
          targetUri: vscode.Uri.file(resolvedLocation.filePath),
          targetRange: new vscode.Range(resolvedLocation.positionLine, 0, resolvedLocation.positionLine + 1, 1)
        } as vscode.DefinitionLink);
      });
    } else {
      const symbolDefinitionItem = await this.findSymbolDefinitionItem(document, position);
      if (symbolDefinitionItem && symbolDefinitionItem.resolvedLocations) {
        symbolDefinitionItem.resolvedLocations.forEach(resolvedLocation => {
          result.push({
            originSelectionRange: symbolDefinitionItem.range,
            targetUri: vscode.Uri.file(resolvedLocation.filePath),
            targetRange: new vscode.Range(resolvedLocation.positionLine, 0, resolvedLocation.positionLine + 1, 1)
          } as vscode.DefinitionLink);
        });
      }
    }
    return result;
  }

  private async performProvideHover(document: vscode.TextDocument, position: vscode.Position) {
    let result = null;
    let definitionItem = null;
    let symbolDefinitionItem = null;
    definitionItem = await this.findCartridgeDefinitionItem(document, position);
    if (definitionItem && definitionItem.resolvedLocations) {
      result = this.createDefinitionHover(definitionItem, DEFINITION_TYPE_TEXT);
    } else {
      symbolDefinitionItem = await this.findSymbolDefinitionItem(document, position);
      if (symbolDefinitionItem && symbolDefinitionItem.resolvedLocations) {
        result = this.createDefinitionHover(symbolDefinitionItem, SYMBOL_DEFINITION_TYPE_TEXT);
      }
    }
    if (!result) {
      // Show hover info no definition found
      if (definitionItem) {
        result = this.createDefinitionHover(definitionItem, DEFINITION_TYPE_TEXT);
      } else if (symbolDefinitionItem) {
        result = this.createDefinitionHover(symbolDefinitionItem, SYMBOL_DEFINITION_TYPE_TEXT);
      }
    }
    return result;
  }

  protected createDefinitionHover(definitionItem: DefinitionItem, definitionTypeText: string): vscode.Hover {
    let content = "``` js";
    if (definitionItem.resolvedLocations && definitionItem.resolvedLocations.length > 0) {
      content += "\nϞϞ(๑⚈‿‿⚈๑)∩ - " + definitionTypeText;
      definitionItem.resolvedLocations.forEach(resolvedLocation => {
        content += '\n"' + resolvedLocation.filePath + '" (' + resolvedLocation.positionLine + ")";
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
      this.logError(error);
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
      this.logError(error);
    }
    return result;
  }

  protected async identifySymbolDefinitionProvider(
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
      this.logInfo(
        "Require statement reference name " + referenceName + " not found. Ignoring symbol statement " + symbolStatement
      );
    }
    return symbolDefinitionItem;
  }

  protected async processDefinitionItem(
    definitionItem: any,
    document: vscode.TextDocument,
    range: vscode.Range
  ): Promise<DefinitionItem> {
    let result = definitionItem;
    if (definitionItem) {
      this.logInfo("Processing " + definitionItem.type + " statement " + definitionItem.statement);
      definitionItem.documentFileName = document.fileName;
      // Check if file exists on current cartridge
      let resolvedLocations: ResolvedLocation[] = [];
      const filePath = await this.resolveCurrentCartridgeFilePath(definitionItem);
      if (filePath) {
        const positionLine = await this.resolvePositionLine(filePath, definitionItem);
        resolvedLocations.push({ filePath: filePath, positionLine: positionLine });
      } else {
        // Trying to find file on workspace cartridges
        const filePaths = await this.findCartridgeHierachyFilePaths(definitionItem);
        if (filePaths && filePaths.length > 0) {
          for (let index = 0; index < filePaths.length; index++) {
            const filePath = filePaths[index];
            const positionLine = await this.resolvePositionLine(filePath, definitionItem);
            resolvedLocations.push({ filePath: filePath, positionLine: positionLine });
          }
        }
      }
      if (resolvedLocations && resolvedLocations.length > 0) {
        this.logInfo(
          "Resolved locations: " + resolvedLocations[0].filePath + " (" + resolvedLocations[0].positionLine + ")."
        );
        result = this.storeDefinitionItem(definitionItem, resolvedLocations, range);
      }
    }
    return result;
  }

  protected async resolvePositionLine(filePath: string, definitionItem: DefinitionItem): Promise<number> {
    let positionLine = 0;

    const symbolElementName = definitionItem.symbolElementName;
    if (symbolElementName) {
      const resolvedDocument = await vscode.workspace.openTextDocument(filePath);
      if (resolvedDocument) {
        let isSymbolElementDefinitionFound = false;
        let firstPositionLineIncludesSymbolElementName = null;
        const symbolElementDefinitionRegex = this.createSymbolElementDefinitionRegex(symbolElementName);
        const resolvedDocumentLines = resolvedDocument.lineCount;
        for (let line = 0; line < resolvedDocumentLines; line++) {
          const lineText = resolvedDocument.lineAt(line).text;
          if (lineText.includes(symbolElementName)) {
            if (!firstPositionLineIncludesSymbolElementName) {
              firstPositionLineIncludesSymbolElementName = line;
            }
            if (symbolElementDefinitionRegex.test(lineText)) {
              this.logDebug("Symbol element definition found at position " + line + " line text: ", lineText);
              positionLine = line;
              isSymbolElementDefinitionFound = true;
              break;
            }
          }
        }
        if (!isSymbolElementDefinitionFound && firstPositionLineIncludesSymbolElementName) {
          positionLine = firstPositionLineIncludesSymbolElementName;
        }
      }
    }

    return positionLine;
  }

  protected createSymbolElementDefinitionRegex(symbolElementName: string): RegExp {
    const symbolElementDefinitionTemplate = this._definitionConfig.symbolElementDefinitionRegexTemplate;
    return new RegExp(symbolElementDefinitionTemplate.replace("{symbolElementName}", symbolElementName));
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
          this.logInfo("resolveCurrentCartridgeFilePath: " + error);
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
          this.logInfo("findCartridgeHierachyFilePaths: " + error);
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

  /****************************************
   * Definition provider store methods
   ***************************************/

  protected getDefinitionItemResultFromStore(lineText, documentFileName): DefinitionItem {
    let result = null;
    const lastDefinitionItem = this._lastStore.definitionItem;
    const lastStoreModifiedTime = this._lastStore.modifiedTime;
    if (
      lastDefinitionItem &&
      lastDefinitionItem.lineText === lineText &&
      lastDefinitionItem.documentFileName === documentFileName
    ) {
      if (!this.isStoreExpired(lastStoreModifiedTime)) {
        this.logDebug('From store cartridge path "' + lastDefinitionItem.path + '"');
        result = lastDefinitionItem;
      } else {
        this.logDebug('Stored definition item expired "' + lastDefinitionItem.path + '"');
      }
    }
    return result;
  }

  protected storeDefinitionItem(
    definitionItem: DefinitionItem,
    resolvedLocations: ResolvedLocation[],
    range: vscode.Range
  ): DefinitionItem {
    definitionItem.resolvedLocations = resolvedLocations;
    definitionItem.range = range;
    this._lastStore.definitionItem = definitionItem;
    this._lastStore.modifiedTime = new Date().getTime();
    return definitionItem;
  }

  protected getProviderResultFromStore(
    document: vscode.TextDocument,
    position: vscode.Position,
    type: string
  ): ProviderResult {
    let result = null;
    const lastProviderResult: ProviderResult = this._lastStore[type];
    const lastStoreModifiedTime = this._lastStore.modifiedTime;
    if (
      lastProviderResult &&
      lastProviderResult.documentFileName === document.fileName &&
      lastProviderResult.positionLine === position.line
    ) {
      if (!this.isStoreExpired(lastStoreModifiedTime)) {
        this.logDebug('From store provider ' + type + ' result "' + lastProviderResult.result + '"');
        result = lastProviderResult;
      } else {
        this.logDebug('Stored provider ' + type + ' result expired "' + lastProviderResult.result + '"');
      }
    }
    return result;
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
    this._lastStore.modifiedTime = new Date().getTime();
    return providerResult;
  }

  protected isStoreExpired(lastStoreModifiedTime: number): boolean {
    let result = false;
    var currentTime = new Date().getTime();
    var expirationTime = lastStoreModifiedTime + this._extensionConfig.storeTimeout;
    var remainingTime = expirationTime - currentTime;
    this.logDebug("isStoreExpired: remainingTime is " + remainingTime);
    return remainingTime < 0;
  }

  /****************************************
   * Definition provider log methods
   ***************************************/

  protected logProviderStart(type: String): number {
    this.logDebug("Starting provider " + type + "...");
    return new Date().getTime();
  }

  protected logProviderEnd(type: String, result: any, startTime: number): void {
    const endTime = new Date().getTime();
    this.logInfo(
      "Executed provider " + type + " with result " + result + " (Process time = " + (endTime - startTime) + "ms)."
    );
  }

  protected logDebug(message, ...args) {
    if (this._extensionConfig.enableDebug) {
      console.log(this._providerClass + " - Debug: " + message, args);
    }
  }

  protected logInfo(message) {
    console.log(this._providerClass + ": " + message);
  }

  protected logError(message) {
    console.log(this._providerClass + " - Error: " + message);
  }

  protected dispose() {
    // Nothing to do here;
  }
}
