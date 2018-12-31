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
  path?: string;
  type?: string;
  documentFileName?: string;
  filePath?: string;
  result?: vscode.Location;
}

export default abstract class BaseDefinitionProvider implements vscode.DefinitionProvider {
  private _extensionConfig: ExtensionConfig = {
    cartridgeDir: CARTRIDGE_DIR
  };
  private _definitionConfig: DefinitionConfig = {};
  private _lastFileItem: FileItem = {};

  constructor(extensionConfig = {}, definitionConfig = {}) {
    this._extensionConfig = Object.assign(this._extensionConfig, extensionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, definitionConfig);
  }

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Definition> {
    let result = null;
    let range = document.getWordRangeAtPosition(position, this._definitionConfig.wordRangeRegex);
    if (range && !range.isEmpty) {
      const line = document.lineAt(position.line);
      result = this.findCartridgeFileLocation(line.text, document, position);
    }
    return result;
  }

  protected async findCartridgeFileLocation(
    lineText: string,
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let result = null;
    try {
      result = this.getFileItemResultFromCache(lineText, document.fileName);
      if (!result) {
        let fileItem = await this.identifyFileItem(lineText);
        if (fileItem) {
          // Check path on current context
          fileItem.documentFileName = document.fileName;
          let filePath = await this.resolveFilePath(fileItem);
          if (!filePath) {
            // Trying to find file on workspace cartridges
            filePath = await this.findCartridgesFilePath(fileItem);
          }
          if (filePath) {
            console.log('Resolved file path "' + filePath + '"');
            result = new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(0, 0, 0, 0));
            this.storeLastFileItem(fileItem, filePath, result);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  protected identifyFileItem(lineText: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let result = null;

      const config = this._definitionConfig;
      let match = config.identifyRegex.exec(lineText);
      if (match && match.length >= config.identifyMatchPathPosition) {
        result = {
          lineText: lineText,
          path: match[config.identifyMatchPathPosition - 1],
          type: config.identifyType
        };
      }

      resolve(result);
    });
  }

  protected resolveFilePath(fileItem: FileItem): Promise<any> {
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
          console.log("resolveFilePath: " + error);
          return resolve(null);
        }
      });
    } else {
      return Promise.reject("resolveFilePath: File path is undefined");
    }
  }

  protected findCartridgesFilePath(fileItem: FileItem): Promise<any> {
    if (fileItem && fileItem.path) {
      const cartridgeDir = this._extensionConfig.cartridgeDir;
      return new Promise((resolve, reject) => {
        try {
          const includePattern = "**/" + cartridgeDir + "/**" + fileItem.path + this.resolveExtension(fileItem);
          vscode.workspace.findFiles(includePattern, "**/node_modules/**").then(files => {
            let resolvedFilePath = null;
            if (files && files.length > 0) {
              resolvedFilePath = files[0].fsPath;
            }
            return resolve(resolvedFilePath);
          });
        } catch (error) {
          console.log("findCartridgesFilePath: " + error);
          return resolve(null);
        }
      });
    } else {
      return Promise.reject("findCartridgesFilePath: File path is undefined");
    }
  }

  protected resolveExtension(fileItem: FileItem) {
    const documentFileName = fileItem.documentFileName;
    const addExtension = fileItem.path.indexOf(".") <= 0;
    return addExtension ? documentFileName.substr(documentFileName.lastIndexOf(".")) : "";
  }

  protected getFileItemResultFromCache(lineText, documentFileName) {
    const lastFileItem = this._lastFileItem;
    if (lastFileItem && lastFileItem.lineText === lineText && lastFileItem.documentFileName === documentFileName) {
      console.log('From cache file path "' + lastFileItem.filePath + '"');
      return lastFileItem.result;
    }
    return null;
  }

  protected storeLastFileItem(fileItem: FileItem, filePath, result) {
    fileItem.filePath = filePath;
    fileItem.result = result;
    this._lastFileItem = fileItem;
  }

  dispose() {
    // Nothing to do here;
  }
}
