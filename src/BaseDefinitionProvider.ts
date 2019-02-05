import * as vscode from "vscode";

const CARTRIDGE_DEFAULT_FOLDER = "cartridge";
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
  identifySimpleSearch?: string; // Simple identify to perform an indenfify regex
  identifyRegex?: RegExp; // Regex to identify a require cartridge text line
  identifyMatchPathPosition?: number; // Match position for the require path declared in identifyRegex
  identifyType?: string; // require cartridge identification type
  cartridgeFolder?: string; // text literal used for cartridge path resolution
  symbolWordRangeRegex?: RegExp; // Regex to identify a symbol statement text
  symbolIdentifyRegex?: RegExp; // Regex to identify a symbol that can need a require cartridge reference
  symbolIdentifyMatchPathPosition?: number; // Match position for the symbol declared in symbolIdentifyRegex
  symbolIdentifyType?: string; // symbol identification type
  symbolElementDefinitionRegexTemplate?: string; // Template to create a RegExp for symbol element definition identification
  symbolNameRegexTemplate?: string; // Template to extract a complete symbol name on a text line
  symbolNameMinSize?: number; // Minimum symbol size name
  isCommentRegex?: RegExp; // Regex for identify code comments
  simpleExportDefinitionStart?: string; // Simple string to identify exported definitions start
  simpleExportDefinitionEnd?: string; // Simple string to identify exported definitions end
  symbolExportDefinitionRegex?: RegExp; // Regex for identify exported definitions
  symbolExportExtractMethodRegexs?: RegExp[]; // Regexs for extract exported definitions
  symbolExportCleanLabelRegexs?: RegExp[]; // Regex for label cleanings
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

export interface SymbolDefinition {
  symbolLineText?: string; // line text where the symbol is defined.
  symbolElementName?: string; // Name of the property, function, ... to symbol definition.
  resolvedLocation?: ResolvedLocation; // resolved location for require cartridge module.
}

export interface ResolvedLocation {
  filePath?: string; // Location document File path.
  resolvedType?: string; // Resolved location type. SOFT or MATCH.
  positionText?: string; // Document text at line position.
  positionLine?: number; // Document line number position.
  positionLineIndex?: number; // Text line substring index start position.
  positionLabel?: string; // Label related to resolved Location
}

export interface DefinitionStore {
  definitionItem?: DefinitionItem; // Item with resolved cartridge definition info, used for generate provider results.
  provideDefinition?: ProviderResult; // Result for definition provider
  provideHover?: ProviderResult; // Result for hover provider
  modifiedTime?: number; // Store modification timestamp
}

export interface ProviderResult {
  documentFileName: string;
  positionLine: number;
  result: any;
}

/**
 * Base class for all definition providers.
 *
 * @export
 * @abstract
 * @class BaseDefinitionProvider
 * @implements {vscode.DefinitionProvider}
 * @implements {vscode.HoverProvider}
 * @implements {vscode.CompletionItemProvider}
 */
export default abstract class BaseDefinitionProvider
  implements vscode.DefinitionProvider, vscode.HoverProvider, vscode.CompletionItemProvider {
  protected _providerClass = "DefinitionProvider";
  protected _extensionConfig: ExtensionConfig = {
    enableDebug: false,
    storeTimeout: 5000
  };
  protected _definitionConfig: DefinitionConfig = {
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

  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionList> {
    let result = [];
    const startTime = this.logProviderStart(this._providerClass + "-completion");

    result = await this.performProvideCompletion(document, position, context);

    this.logProviderEnd(this._providerClass + "-completion", result, startTime);
    return new vscode.CompletionList(result, false);
  }

  /****************************************
   * Provider methods to implement
   ***************************************/

  protected abstract async performProvideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.DefinitionLink[]>;

  protected abstract async performProvideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover>;

  protected abstract async performProvideCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]>;

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
        this.logDebug("From store provider " + type + ' result "' + lastProviderResult.result + '"');
        result = lastProviderResult;
      } else {
        this.logDebug("Stored provider " + type + ' result expired "' + lastProviderResult.result + '"');
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
    if (result) {
      if (Array.isArray(result) && result.length === 0) {
        this.logDebug(this.getLogProviderEndMesssage(type, result, startTime));
      } else {
        this.logInfo(this.getLogProviderEndMesssage(type, result, startTime));
      }
    } else {
      this.logDebug(this.getLogProviderEndMesssage(type, result, startTime));
    }
  }

  protected getLogProviderEndMesssage(type: String, result: any, startTime: number): string {
    const endTime = new Date().getTime();
    return (
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
