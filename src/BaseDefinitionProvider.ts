import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const CARTRIDGE_DIR = "cartridge";

export interface ExtensionConfig {
  filetypes?: string;
  cartridgeDir?: string;
}

export interface DefinitionConfig {
  wordRangeRegex?: RegExp;
  identifyRegex?: RegExp;
  identifyMatchPathPosition?: number;
  identifyType?: string;
}

export interface FileItem {
  lineText?: string;
  statement?: string;
  path?: string;
  type?: string;
  documentFileName?: string;
  filePaths?: string[];
  range?: vscode.Range;
}

export default abstract class BaseDefinitionProvider implements vscode.DefinitionProvider, vscode.HoverProvider {
  protected _extensionConfig: ExtensionConfig = {
    cartridgeDir: CARTRIDGE_DIR
  };
  protected _definitionConfig: DefinitionConfig = {};
  protected _lastFileItem: FileItem = {};

  constructor(extensionConfig = {}, definitionConfig = {}) {
    this._extensionConfig = Object.assign(this._extensionConfig, extensionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, definitionConfig);
  }

  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Definition> {
    let result = [];
    const fileItem = await this.findCartridgeFileItem(document, position);
    if (fileItem && fileItem.filePaths) {
      fileItem.filePaths.forEach((filePath) => {
        result.push(new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(0, 0, 0, 0)));
      });
    }
    return result;
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover> {
    let result = null;
    const fileItem = await this.findCartridgeFileItem(document, position);
    if (fileItem && fileItem.filePaths) {
      let content = "Cartridges: ";
      fileItem.filePaths.forEach((filePath) => {
        content += '\n' + filePath;
      });
      return new vscode.Hover(content, fileItem.range);
    }
    return null;
  }

  protected async findCartridgeFileItem(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<FileItem> {
    let result = null;
    try {
      let range = document.getWordRangeAtPosition(position, this._definitionConfig.wordRangeRegex);
      if (range && !range.isEmpty) {
        const lineText = document.lineAt(position.line).text;
        result = this.getFileItemResultFromCache(lineText, document.fileName);
        if (!result) {
          let fileItem = await this.identifyFileItem(lineText);
          if (fileItem) {
            console.log('Processing ' + fileItem.type + ' statement ' + fileItem.statement);
            fileItem.documentFileName = document.fileName;
            // Check if file exists on current cartridge
            let filePaths = [];
            const filePath = await this.resolveCurrentCartridgeFilePath(fileItem);
            if (filePath) {
              filePaths.push(filePath);
            } else {
              // Trying to find file on workspace cartridges
              filePaths = await this.findCartridgeHierachyFilePaths(fileItem);
            }
            if (filePaths) {
              console.log('Resolved file paths "' + filePaths + '"');
              result = this.storeLastFileItem(fileItem, filePaths, range);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  protected identifyFileItem(lineText: string): Promise<FileItem> {
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

  protected resolveCurrentCartridgeFilePath(fileItem: FileItem): Promise<string> {
    if (fileItem && fileItem.path) {
      const cartridgeDir = this._extensionConfig.cartridgeDir;
      return new Promise((resolve, reject) => {
        try {
          // Create file path
          const fileName = fileItem.documentFileName;
          const initialPath = fileName.substring(0, fileName.indexOf(cartridgeDir + path.sep));
          const filePath = initialPath + cartridgeDir + fileItem.path + this.resolveExtension(fileItem);
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

  protected findCartridgeHierachyFilePaths(fileItem: FileItem): Promise<string[]> {
    if (fileItem && fileItem.path) {
      const cartridgeDir = this._extensionConfig.cartridgeDir;
      return new Promise((resolve, reject) => {
        try {
          const includePattern = "**/" + cartridgeDir + "/**" + fileItem.path + this.resolveExtension(fileItem);
          vscode.workspace.findFiles(includePattern, "**/node_modules/**").then(files => {
            let resolvedfilePaths: string[] = [];
            if (files && files.length > 0) {
              files.forEach((file) => {
                if (file.fsPath !== fileItem.documentFileName) {
                  // Include all files except current document
                  resolvedfilePaths.push(file.fsPath);
                }
              });
            }
            return resolve(resolvedfilePaths);
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

  protected resolveExtension(fileItem: FileItem): string {
    const documentFileName = fileItem.documentFileName;
    const addExtension = fileItem.path.indexOf(".") <= 0;
    return addExtension ? documentFileName.substring(documentFileName.lastIndexOf(".")) : "";
  }

  protected getFileItemResultFromCache(lineText, documentFileName): FileItem {
    const lastFileItem = this._lastFileItem;
    if (lastFileItem && lastFileItem.lineText === lineText && lastFileItem.documentFileName === documentFileName) {
      console.log('From cache cartridge path "' + lastFileItem.path + '"');
      return lastFileItem;
    }
    return null;
  }

  protected storeLastFileItem(fileItem: FileItem, filePaths: string[], range: vscode.Range ) {
    fileItem.filePaths = filePaths;
    fileItem.range = range;
    this._lastFileItem = fileItem;
    return fileItem;
  }

  dispose() {
    // Nothing to do here;
  }
}
