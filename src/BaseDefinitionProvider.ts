import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const CARTRIDGE_DEFAULT_FOLDER = "cartridge";

export interface ExtensionConfig {
  scriptFiletypes?: string;
  templateFiletypes?: string;
}

export interface DefinitionConfig {
  wordRangeRegex?: RegExp;
  identifyRegex?: RegExp;
  identifyMatchPathPosition?: number;
  identifyType?: string;
  cartridgeFolder?: string;
}

export interface DefinitionItem {
  lineText?: string;
  statement?: string;
  path?: string;
  type?: string;
  documentFileName?: string;
  filePaths?: string[];
  range?: vscode.Range;
}

export default abstract class BaseDefinitionProvider implements vscode.DefinitionProvider, vscode.HoverProvider {
  protected _extensionConfig: ExtensionConfig = {};
  protected _definitionConfig: DefinitionConfig = {
    cartridgeFolder: CARTRIDGE_DEFAULT_FOLDER
  };
  protected _lastDefinitionItem: DefinitionItem = {};

  public constructor(extensionConfig = {}, definitionConfig = {}) {
    this._extensionConfig = Object.assign(this._extensionConfig, extensionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, definitionConfig);
  }

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.DefinitionLink[]> {
    let result = [];
    const definitionItem = await this.findCartridgeDefinitionItem(document, position);
    if (definitionItem && definitionItem.filePaths) {
      definitionItem.filePaths.forEach(filePath => {
        result.push({
          originSelectionRange: definitionItem.range,
          targetUri: vscode.Uri.file(filePath),
          targetRange: new vscode.Range(0, 0, 0, 0)
        } as vscode.DefinitionLink);
      });
    }
    return result;
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover> {
    let result = null;
    const definitionItem = await this.findCartridgeDefinitionItem(document, position);
    if (definitionItem && definitionItem.filePaths) {
      let content = "``` js";
      content += "\nϞϞ(๑⚈‿‿⚈๑)∩ - ";
      if (definitionItem.filePaths.length > 0) {
        content += "definitions";
        definitionItem.filePaths.forEach(filePath => {
          content += '\n"' + filePath + '"';
        });
      } else {
        content += "no definitions";
      }
      content += "```";
      return new vscode.Hover(content, definitionItem.range);
    }
    return null;
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
        result = this.getDefinitionItemResultFromCache(lineText, document.fileName);
        if (!result) {
          let definitionItem = await this.identifyDefinitionItem(lineText);
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
              console.log('Resolved file paths "' + filePaths + '"');
              result = this.storeLastDefinitionItem(definitionItem, filePaths, range);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  protected identifyDefinitionItem(lineText: string): Promise<DefinitionItem> {
    return new Promise((resolve, reject) => {
      let result = null;

      const config = this._definitionConfig;
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

  protected getDefinitionItemResultFromCache(lineText, documentFileName): DefinitionItem {
    const lastDefinitionItem = this._lastDefinitionItem;
    if (
      lastDefinitionItem &&
      lastDefinitionItem.lineText === lineText &&
      lastDefinitionItem.documentFileName === documentFileName
    ) {
      console.log('From cache cartridge path "' + lastDefinitionItem.path + '"');
      return lastDefinitionItem;
    }
    return null;
  }

  protected storeLastDefinitionItem(definitionItem: DefinitionItem, filePaths: string[], range: vscode.Range) {
    definitionItem.filePaths = filePaths;
    definitionItem.range = range;
    this._lastDefinitionItem = definitionItem;
    return definitionItem;
  }

  dispose() {
    // Nothing to do here;
  }
}
