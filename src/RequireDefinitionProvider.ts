import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const WORD_RANGE_REGEX = /('|")\*[a-zA-Z0-9_\/\*\.]*('|")/g;
const REQUIRE_REGEX = /(require\s*\(\s*)(['"])\*\/cartridge(.*?[^\\])\2\s*\)/g;
const REQUIRE_MATCH_PATH_POSITION = 4;
const REQUIRE_TYPE = "require";
const CARTRIDGE_DIR = "cartridge";

export default class RequireDefinitionProvider implements vscode.DefinitionProvider {
  private _configuration: any = {};
  private _lastFileItem: any = {};

  constructor(configuration) {
    this._configuration = Object.assign(this._configuration, configuration);
  }

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Definition> {
    let result = null;
    let range = document.getWordRangeAtPosition(position, WORD_RANGE_REGEX);
    const line = document.lineAt(position.line);
    if (range && line.text) {
      result = this.findCartridgeFileLocation(line.text, document, position);
    }
    return result;
  }

  private async findCartridgeFileLocation(lineText: string, document: vscode.TextDocument, position: vscode.Position) {
    let result = null;
    try {
      result = this.getFileItemResultFromCache(lineText, document.fileName);
      if (!result) {
        let fileItem = await this.findRequirePath(lineText, REQUIRE_REGEX);
        if (fileItem) {
          // Check path on current context
          fileItem.documentFileName = document.fileName;
          let filePath = await this.resolveFilePath(fileItem);
          if (!filePath) {
            // Trying to find file on workspace
            filePath = await this.findFilePath(fileItem);
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

  private findRequirePath(lineText: string, expr: RegExp): Promise<any> {
    return new Promise((resolve, reject) => {
      let result = null;

      let match = expr.exec(lineText);
      if (match && match.length >= REQUIRE_MATCH_PATH_POSITION) {
        result = {
          lineText: lineText,
          path: match[REQUIRE_MATCH_PATH_POSITION - 1],
          type: REQUIRE_TYPE
        };
      }

      resolve(result);
    });
  }

  private resolveFilePath(fileItem): Promise<any> {
    if (fileItem && fileItem.path) {
      return new Promise((resolve, reject) => {
        try {
          // Create file path
          const fileName = fileItem.documentFileName;
          const initialPath = fileName.substring(0, fileName.indexOf(CARTRIDGE_DIR + path.sep));
          const filePath = initialPath + CARTRIDGE_DIR + fileItem.path + this.resolveExtension(fileItem);
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

  private findFilePath(fileItem): Promise<any> {
    if (fileItem && fileItem.path) {
      return new Promise((resolve, reject) => {
        try {
          const includePattern = "**/" + CARTRIDGE_DIR + "/**" + fileItem.path + this.resolveExtension(fileItem);
          vscode.workspace.findFiles(includePattern, "**/node_modules/**").then(files => {
            let resolvedFilePath = null;
            if (files && files.length > 0) {
              resolvedFilePath = files[0].fsPath;
            }
            return resolve(resolvedFilePath);
          });
        } catch (error) {
          console.log("findFilePath: " + error);
          return resolve(null);
        }
      });
    } else {
      return Promise.reject("findFilePath: File path is undefined");
    }
  }

  private resolveExtension(fileItem) {
    const documentFileName = fileItem.documentFileName;
    const addExtension = fileItem.path.indexOf(".") <= 0;
    return addExtension ? documentFileName.substr(documentFileName.lastIndexOf(".")) : "";
  }

  getFileItemResultFromCache(lineText, documentFileName) {
    const lastFileItem = this._lastFileItem;
    if (lastFileItem && lastFileItem.lineText === lineText && lastFileItem.documentFileName === documentFileName) {
      console.log('From cache file path "' + lastFileItem.filePath + '"');
      return lastFileItem.result;
    }
    return null;
  }

  private storeLastFileItem(fileItem, filePath, result) {
    fileItem.filePath = filePath;
    fileItem.result = result;
    this._lastFileItem = fileItem;
  }

  dispose() {
    // Nothing to do here;
  }
}
