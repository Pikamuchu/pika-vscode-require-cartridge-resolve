import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import BaseDefinitionProvider, { DefinitionConfig, DefinitionItem, ResolvedLocation } from "./BaseDefinitionProvider";

const SYMBOL_DEFINITION_TYPE_TEXT = "symbol definitions";
const DEFINITION_TYPE_TEXT = "definitions";

const RESOLVED_TYPE_MATCH = "MATCH";
const RESOLVED_TYPE_INCLUDES = "INCLUDES";
const RESOLVED_TYPE_COMPLETION = "COMPLETION";

const MAX_EXTRACT_REGEX_LOOP = 10;

const HOVER_MESSAGE_HEADER = "```\n";
const PIKA_EMOJI_FOUND = "ϞϞ(๑⚈‿‿⚈๑)∩ - ";
const PIKA_EMOJI_NOT_FOUND = "ϞϞ(๑⊙__☉๑)∩ - no ";

const defaultDefinitionConfig: DefinitionConfig = {
  symbolWordRangeRegex: /([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]*)/,
  symbolIdentifyRegex: /.+/,
  symbolIdentifyMatchPathPosition: 0,
  symbolElementDefinitionRegexTemplate: "(export)?\\s*(function|static)\\s*({symbolElementName})\\s*\\(",
  symbolNameRegexTemplate: "({symbolElementName}[a-zA-Z0-9_-]*)",
  symbolNameMinSize: 3,
  isCommentRegex: /^\s*?(\/\*|\*|\/\/).*/,
  simpleExportDefinitionStart: "export",
  simpleExportDefinitionEnd: "};",
  symbolExportDefinitionRegex: /^\s*(export|module\.exports)/,
  symbolExportExtractMethodRegexs: [
    /=\s*([a-zA-Z0-9_-]+)\s*;/,
    /^\s*([a-zA-Z0-9_-]+\s*:\s*function.*){/,
    /^\s*([a-zA-Z0-9_-]+)\s*:\s*[a-zA-Z0-9_-]+\s*/
  ],
  symbolExportCleanLabelRegexs: [
    /\s*:\s*[a-zA-Z]+\s*/g,
    /\s*\|\s*[a-zA-Z]+/g,
    /\s*\<[a-zA-Z]+\>\s*/g,
    /\s+$/,
    /readonly\s+/
  ]
};

/**
 * Implements default provide definition behaviour.
 *
 * @export
 * @abstract
 * @class DefaultDefinitionProvider
 * @extends {BaseDefinitionProvider}
 */
export default abstract class DefaultDefinitionProvider extends BaseDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = {}) {
    super(extensionConfig, definitionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, defaultDefinitionConfig);
  }

  /**
   * Performs provide definition.
   *
   * @protected
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {Promise<vscode.DefinitionLink[]>}
   * @memberof DefaultDefinitionProvider
   */
  protected async performProvideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.DefinitionLink[]> {
    let result = [];
    const definitionItem = await this.findCartridgeDefinitionItem(document, position);
    if (definitionItem && definitionItem.resolvedLocations) {
      let lastFilepath = "";
      definitionItem.resolvedLocations.forEach(resolvedLocation => {
        // For cartridge declarations result only the first symbol of every resolved filepath
        if (resolvedLocation.filePath !== lastFilepath) {
          result.push({
            originSelectionRange: definitionItem.range,
            targetUri: vscode.Uri.file(resolvedLocation.filePath),
            targetRange: new vscode.Range(resolvedLocation.positionLine, 0, resolvedLocation.positionLine + 1, 1)
          } as vscode.DefinitionLink);
          lastFilepath = resolvedLocation.filePath;
        }
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

  /**
   * Performs provide hover.
   *
   * @protected
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns
   * @memberof DefaultDefinitionProvider
   */
  protected async performProvideHover(document: vscode.TextDocument, position: vscode.Position) {
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

  /**
   * Create definition details text for provide hover.
   *
   * @protected
   * @param {DefinitionItem} definitionItem
   * @param {string} definitionTypeText
   * @returns {vscode.Hover}
   * @memberof DefaultDefinitionProvider
   */
  protected createDefinitionHover(definitionItem: DefinitionItem, definitionTypeText: string): vscode.Hover {
    let content = HOVER_MESSAGE_HEADER;
    if (definitionItem.resolvedLocations && definitionItem.resolvedLocations.length > 0) {
      let lastFilePath = "";
      let lastSymbolDefinitionLabel = "";
      content += PIKA_EMOJI_FOUND + definitionTypeText;
      definitionItem.resolvedLocations.forEach(resolvedLocation => {
        if (resolvedLocation.filePath !== lastFilePath) {
          // Print resolved file path
          if (resolvedLocation.resolvedType === RESOLVED_TYPE_MATCH) {
            content += "\n'" + resolvedLocation.filePath + "' (" + resolvedLocation.positionLine + ")";
          } else if (resolvedLocation.positionLine === 0 && definitionTypeText === SYMBOL_DEFINITION_TYPE_TEXT) {
            content = HOVER_MESSAGE_HEADER + PIKA_EMOJI_NOT_FOUND + definitionTypeText +
              " found on file\n'" + resolvedLocation.filePath + "'";
          } else {
            content += "\n'" + resolvedLocation.filePath + "'";
          }
          lastFilePath = resolvedLocation.filePath;
        }
        // For symbol declarations print only one symbol variation of every resolved filepath.
        // Remove this condition when variation details are implemented.
        if (resolvedLocation.filePath + resolvedLocation.positionLabel !== lastSymbolDefinitionLabel) {
          if (resolvedLocation.resolvedType === RESOLVED_TYPE_INCLUDES) {
            if (resolvedLocation.positionLabel !== definitionItem.symbolElementName) {
              content += "\nDid you mean '" + resolvedLocation.positionLabel + "' (" + resolvedLocation.positionLine + ") ?";
            } else {
              content += "\n" + resolvedLocation.positionLabel + " (" + resolvedLocation.positionLine + ")";
            }
          } else if (resolvedLocation.resolvedType === RESOLVED_TYPE_COMPLETION
              || resolvedLocation.resolvedType === RESOLVED_TYPE_MATCH) {
            content += "\n" + resolvedLocation.positionLabel;
          }
          lastSymbolDefinitionLabel = resolvedLocation.filePath + resolvedLocation.positionLabel;
        }
      });
    } else {
      content += PIKA_EMOJI_NOT_FOUND + definitionTypeText;
    }
    content += "```";
    return new vscode.Hover(content, definitionItem.range);
  }

  /**
   * Performs provide completion.
   *
   * @protected
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CompletionContext} context
   * @returns {Promise<vscode.CompletionItem[]>}
   * @memberof DefaultDefinitionProvider
   */
  protected async performProvideCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    let result = [];
    const symbolDefinitionItem = await this.findSymbolDefinitionItem(document, position);
    if (symbolDefinitionItem && symbolDefinitionItem.resolvedLocations) {
      let lastSymbolDefinitionLabel = "";
      symbolDefinitionItem.resolvedLocations.forEach(resolvedLocation => {
        // For symbol declarations suggest only one symbol variation.
        // Remove this condition when variation details are implemented.
        if (resolvedLocation.positionLabel !== lastSymbolDefinitionLabel) {
          result.push({
            label: resolvedLocation.positionLabel,
            kind: this.resolveCompletionType(resolvedLocation)
          } as vscode.CompletionItem);
          lastSymbolDefinitionLabel = resolvedLocation.positionLabel;
        }
      });
    }
    return result;
  }

  protected resolveCompletionType(resolvedLocation: ResolvedLocation): vscode.CompletionItemKind {
    return vscode.CompletionItemKind.Function;
  }

  /**
   * Finds require cartridge definitionItem details.
   *
   * @protected
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {Promise<DefinitionItem>}
   * @memberof DefaultDefinitionProvider
   */
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

  /**
   * Finds symbol definitionItem details.
   *
   * @protected
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {Promise<DefinitionItem>}
   * @memberof DefaultDefinitionProvider
   */
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

  /**
   * Identifies symbol definitionItem for definition providers.
   *
   * @protected
   * @param {vscode.Position} position
   * @param {vscode.TextDocument} document
   * @param {string} symbolStatement
   * @returns {Promise<DefinitionItem>}
   * @memberof DefaultDefinitionProvider
   */
  protected async identifySymbolDefinitionProvider(
    position: vscode.Position,
    document: vscode.TextDocument,
    symbolStatement: string
  ): Promise<DefinitionItem> {
    let symbolDefinitionItem: DefinitionItem = null;
    let positionLine = position.line;
    const referenceName = symbolStatement.substring(0, symbolStatement.indexOf("."));
    while (!symbolDefinitionItem && positionLine >= 0) {
      const lineText = document.lineAt(positionLine).text;
      if (this.identifySimpleSearch(lineText, referenceName)) {
        const definitionItem = await this.identifyDefinitionItem(lineText);
        if (definitionItem) {
          symbolDefinitionItem = definitionItem;
          symbolDefinitionItem.symbolStatement = symbolStatement;
          symbolDefinitionItem.symbolReferenceName = referenceName;
          symbolDefinitionItem.symbolElementName = symbolStatement.substring(symbolStatement.indexOf(".") + 1);
        }
      }
      positionLine = positionLine - 1;
    }
    if (!symbolDefinitionItem) {
      this.logDebug(
        "Require statement reference name " + referenceName + " not found. Ignoring symbol statement " + symbolStatement
      );
    }
    return symbolDefinitionItem;
  }

  /**
   * Adds definition details to definitionItem.
   *
   * @protected
   * @param {*} definitionItem
   * @param {vscode.TextDocument} document
   * @param {vscode.Range} range
   * @returns {Promise<DefinitionItem>}
   * @memberof DefaultDefinitionProvider
   */
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
        const resolvedSymbolLocation = await this.resolveSymbolLocation(filePath, definitionItem);
        resolvedLocations.push(...resolvedSymbolLocation);
      } else {
        // Trying to find file on workspace cartridges
        const filePaths = await this.findCartridgeHierachyFilePaths(definitionItem);
        if (filePaths && filePaths.length > 0) {
          for (let index = 0; index < filePaths.length; index++) {
            const filePath = filePaths[index];
            const resolvedSymbolLocation = await this.resolveSymbolLocation(filePath, definitionItem);
            resolvedLocations.push(...resolvedSymbolLocation);
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

  /**
   * Resolves definitionItem symbol location.
   *
   * @protected
   * @param {string} filePath
   * @param {DefinitionItem} definitionItem
   * @returns {Promise<ResolvedLocation[]>}
   * @memberof DefaultDefinitionProvider
   */
  protected async resolveSymbolLocation(filePath: string, definitionItem: DefinitionItem): Promise<ResolvedLocation[]> {
    let resolvedLocations = [];

    const symbolElementName = definitionItem.symbolElementName;
    if (symbolElementName || symbolElementName === "") {
      const resolvedDocument = await vscode.workspace.openTextDocument(filePath);
      if (resolvedDocument) {
        if (this.isSymbolNameSearcheable(symbolElementName)) {
          // if symbol has enought char search it on document
          resolvedLocations = this.searchDocumentSymbolsDefinitions(resolvedDocument, symbolElementName, filePath);
        } else {
          // Parse all document symbols and then filter by symbolElementName
          resolvedLocations = this.parseDocumentSymbolsDefinitions(resolvedDocument, symbolElementName, filePath);
        }
      }
    }

    if (resolvedLocations.length === 0) {
      resolvedLocations.push({ filePath: filePath, positionLine: 0 } as ResolvedLocation);
    }

    return resolvedLocations;
  }

  protected isSymbolNameSearcheable(symbolElementName: string): boolean {
    return symbolElementName.length >= this._definitionConfig.symbolNameMinSize;
  }

  /**
   * Searches symbol definition in resolved document.
   *
   * @protected
   * @param {vscode.TextDocument} resolvedDocument
   * @param {string} symbolElementName
   * @param {string} filePath
   * @returns {ResolvedLocation[]}
   * @memberof DefaultDefinitionProvider
   */
  protected searchDocumentSymbolsDefinitions(
    resolvedDocument: vscode.TextDocument,
    symbolElementName: string,
    filePath: string
  ): ResolvedLocation[] {
    let resolvedLocations = [];

    let softSymbolElementNamesFound = [];
    const symbolElementDefinitionRegex = this.createSymbolElementDefinitionRegex(symbolElementName);
    const resolvedDocumentLines = resolvedDocument.lineCount;
    for (let line = 0; line < resolvedDocumentLines; line++) {
      const lineText = resolvedDocument.lineAt(line).text;
      if (lineText.includes(symbolElementName)) {
        if (symbolElementDefinitionRegex.test(lineText)) {
          this.logDebug("Symbol element match definition found at position " + line + " line text: ", lineText);
          resolvedLocations = [
            {
              filePath: filePath,
              resolvedType: RESOLVED_TYPE_MATCH,
              positionLine: line,
              positionText: lineText,
              positionLineIndex: 0,
              positionLabel: symbolElementName
            } as ResolvedLocation
          ];
          break;
        } else if (!this.isTextComment(lineText)) {
          this.logDebug("Symbol element soft definition found at position " + line + " line text: ", lineText);
          // Adding soft match to location list
          const softSymbolElementName = this.extractCompleteSymbolElementName(symbolElementName, lineText);
          if (!(softSymbolElementNamesFound.indexOf(softSymbolElementName) > -1)) {
            softSymbolElementNamesFound.push(softSymbolElementName);
            resolvedLocations.push({
              filePath: filePath,
              resolvedType: RESOLVED_TYPE_INCLUDES,
              positionLine: line,
              positionText: lineText,
              positionLineIndex: 0,
              positionLabel: softSymbolElementName
            } as ResolvedLocation);
          }
        }
      }
    }

    return resolvedLocations;
  }

  /**
   * Parses all symbol definitions from resolved document.
   *
   * @protected
   * @param {vscode.TextDocument} resolvedDocument
   * @param {string} symbolElementName
   * @param {string} filePath
   * @returns {ResolvedLocation[]}
   * @memberof DefaultDefinitionProvider
   */
  protected parseDocumentSymbolsDefinitions(
    resolvedDocument: vscode.TextDocument,
    symbolElementName: string,
    filePath: string
  ): ResolvedLocation[] {
    let resolvedLocations = [];
    const resolvedDocumentLines = resolvedDocument.lineCount;
    for (let line = 0; line < resolvedDocumentLines; line++) {
      let lineText = resolvedDocument.lineAt(line).text;
      if (lineText.includes(this._definitionConfig.simpleExportDefinitionStart)) {
        if (this._definitionConfig.symbolExportDefinitionRegex.test(lineText)) {
          this.logDebug("Symbol exported match found at position " + line + " line text: ", lineText);
          let endLoop = false;
          while (!endLoop) {
            for (let extractRegex of this._definitionConfig.symbolExportExtractMethodRegexs) {
              const extractedSymbolLabels = this.extractSymbolLabels(extractRegex, lineText, line, filePath);
              if (extractedSymbolLabels && extractedSymbolLabels.length > 0) {
                this.processExtractedSymbolLabels(extractedSymbolLabels, resolvedDocument, resolvedLocations);
                break;
              }
            }
            line++;
            if (
              lineText.includes(this._definitionConfig.simpleExportDefinitionEnd) ||
              line >= resolvedDocument.lineCount
            ) {
              endLoop = true;
            } else {
              lineText = resolvedDocument.lineAt(line).text;
            }
          }
        }
      }
    }

    return resolvedLocations;
  }

  protected processExtractedSymbolLabels(extractedSymbolLabels: ResolvedLocation[], resolvedDocument: vscode.TextDocument, resolvedLocations: any[]) {
    extractedSymbolLabels.forEach((extractedSymbolLabel) => {
      resolvedLocations.push(extractedSymbolLabel);
    });
  }

  /**
   * Extract symbol labels from text line.
   *
   * @protected
   * @param {RegExp} extractRegex
   * @param {string} lineText
   * @param {number} line
   * @param {string} filePath
   * @returns {ResolvedLocation[]}
   * @memberof DefaultDefinitionProvider
   */
  protected extractSymbolLabels(extractRegex: RegExp, lineText: string, line: number, filePath: string): ResolvedLocation[] {
    let resolvedLocations = [];
    let match, lastMatch, i = 0, endMatch = false;
    while ((match = extractRegex.exec(lineText)) !== null && !endMatch && i < MAX_EXTRACT_REGEX_LOOP) {
      if (match.length === 2 && lastMatch !== match[1]) {
        let symbolLabel : string = match[1];
        this._definitionConfig.symbolExportCleanLabelRegexs.forEach((symbolExportCleanLabelRegex) => {
          symbolLabel = symbolLabel.replace(symbolExportCleanLabelRegex, "");
        });
        symbolLabel = symbolLabel.replace(/\($/, "(...)");
        this.logDebug("Symbol element match definition " + symbolLabel + " found at position " + line + " line text: ", lineText);
        resolvedLocations.push({
          filePath: filePath,
          resolvedType: RESOLVED_TYPE_COMPLETION,
          positionLine: line,
          positionText: lineText,
          positionLineIndex: 0,
          positionLabel: symbolLabel
        } as ResolvedLocation);
        lastMatch = match[1];
      }
      else {
        endMatch = true;
      }
      i++;
    }
    return resolvedLocations;
  }

  protected isTextComment(lineText: string): boolean {
    return this._definitionConfig.isCommentRegex.test(lineText);
  }

  protected extractCompleteSymbolElementName(symbolElementName: string, lineText: string): string {
    let result = symbolElementName;
    const symbolNameRegexTemplate = this._definitionConfig.symbolNameRegexTemplate;
    const symbolNameRegex = new RegExp(symbolNameRegexTemplate.replace("{symbolElementName}", symbolElementName));
    let match = symbolNameRegex.exec(lineText);
    if (match) {
      result = match[0];
    }
    return result;
  }

  protected createSymbolElementDefinitionRegex(symbolElementName: string): RegExp {
    const symbolElementDefinitionTemplate = this._definitionConfig.symbolElementDefinitionRegexTemplate;
    return new RegExp(symbolElementDefinitionTemplate.replace("{symbolElementName}", symbolElementName));
  }

  protected identifySimpleSearch(lineText: string, referenceName: string): boolean {
    return (
      lineText &&
      lineText.includes(this._definitionConfig.identifySimpleSearch) &&
      lineText.includes(referenceName) &&
      new RegExp("\\s*[var|const|let]\\s+" + referenceName + "\\s+").test(lineText)
    );
  }

  /**
   * Identifies definition item in text line.
   *
   * @protected
   * @param {string} lineText
   * @returns {Promise<DefinitionItem>}
   * @memberof DefaultDefinitionProvider
   */
  protected identifyDefinitionItem(lineText: string): Promise<DefinitionItem> {
    const config = this._definitionConfig;
    return new Promise((resolve, reject) => {
      let result = null;

      let match = config.identifyRegex.exec(lineText);
      if (match && match.length >= config.identifyMatchPathPosition) {
        result = {
          lineText: lineText,
          statement: match[0],
          path: this.processIdentifyMatchPath(match[config.identifyMatchPathPosition - 1]),
          type: config.identifyType
        };
      }

      resolve(result);
    });
  }

  /**
   * Process identified match path.
   *
   * @param {string} path
   * @returns {string}
   */
  protected processIdentifyMatchPath(path: string): string {
    return path;
  }

  /**
   * Resolves definition item file path on current cartridge.
   *
   * @protected
   * @param {DefinitionItem} definitionItem
   * @returns {Promise<string>}
   * @memberof DefaultDefinitionProvider
   */
  protected resolveCurrentCartridgeFilePath(definitionItem: DefinitionItem): Promise<string> {
    if (definitionItem && definitionItem.path) {
      const cartridgeFolder = this._definitionConfig.cartridgeFolder;
      return new Promise((resolve, reject) => {
        try {
          // Create file path
          const fileName = definitionItem.documentFileName;
          let initialPath = fileName.substring(0, fileName.indexOf(cartridgeFolder + path.sep));
          if (!initialPath || initialPath === "") {
            let workspaceFolder = vscode.workspace.workspaceFolders[0];
            if (vscode.workspace.workspaceFolders.length > 1) {
              vscode.workspace.workspaceFolders.forEach((workspace) => {
                if (workspace.name === "workspace") {
                  workspaceFolder = workspace;
                }
              });
            }
            initialPath = workspaceFolder && workspaceFolder.uri.fsPath;
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

  /**
   * Find all cartridge definition item file paths.
   *
   * @protected
   * @param {DefinitionItem} definitionItem
   * @returns {Promise<string[]>}
   * @memberof DefaultDefinitionProvider
   */
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
}
