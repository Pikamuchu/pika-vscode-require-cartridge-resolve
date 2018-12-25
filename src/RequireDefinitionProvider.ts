import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const REQUIRE_REGEX = /(require\s*\(\s*)(['"])\*\/cartridge(.*?[^\\])\2\s*\)/g;
const REQUIRE_MATCH_PATH_POSITION = 4;
const CARTRIDGE_DIR = "cartridge";

export default class RequireDefinitionProvider
  implements vscode.DefinitionProvider {
  private _configuration: any = {};

  constructor(configuration) {
    this._configuration = Object.assign(this._configuration, configuration);
  }

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    let result = null;
    const line = document.lineAt(position.line);
    if (line.text) {
      result = this.findRequireFilePosition(line.text, document, position);
    }
    return result;
  }

  private async findRequireFilePosition(
    lineText: string,
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let result = null;
    try {
      let fileItem = await this.findRequirePath(lineText, REQUIRE_REGEX);
      if (fileItem) {
        // Check path on current context
        let filePath = await this.resolveFilePath(fileItem, document);
        if (!filePath) {
          // Trying to find file on workspace
          filePath = await this.findFilePath(fileItem, document);
        }
        if (filePath) {
          console.log('Resolved file path "' + filePath + '"');
          result = new vscode.Location(
            vscode.Uri.file(filePath),
            new vscode.Range(0, 0, 0, 0)
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  private findRequirePath(text: string, expr: RegExp): Promise<any> {
    return new Promise((resolve, reject) => {
      let result = null;

      let match = expr.exec(text);
      if (match && match.length >= REQUIRE_MATCH_PATH_POSITION) {
        result = {
          path: match[REQUIRE_MATCH_PATH_POSITION - 1]
        };
      }

      resolve(result);
    });
  }

  private resolveFilePath(fileItem, document): Promise<any> {
    if (fileItem && fileItem.path) {
      return new Promise((resolve, reject) => {
        const fileName = path.dirname(document.fileName);
        const cartridgeIndex =
          fileName.indexOf("\\") >= 0
            ? CARTRIDGE_DIR + "\\"
            : CARTRIDGE_DIR + "/";
        let filePath = fileName.substring(0, fileName.indexOf(cartridgeIndex));
        filePath += CARTRIDGE_DIR + fileItem.path + ".js";
        // Check if filename exists
        fs.stat(filePath, (error, stat) => {
          let resolvedFilePath = null;
          if (!error) {
            resolvedFilePath = filePath;
          }
          return resolve(resolvedFilePath);
        });
      });
    } else {
      return Promise.reject("resolveFilePath: File path is undefined");
    }
  }

  private findFilePath(fileItem, document): Promise<any> {
    if (fileItem && fileItem.path) {
      return new Promise((resolve, reject) => {
        const includePattern = "**/" + CARTRIDGE_DIR + "/**" + fileItem.path + ".js";
        vscode.workspace.findFiles(includePattern)
          .then(files => {
            let resolvedFilePath = null;
            if (files && files.length > 0) {
              resolvedFilePath = files[0].fsPath;
            }
            return resolve(resolvedFilePath);
          });
      });
    } else {
      return Promise.reject("findFilePath: File path is undefined");
    }
  }

  dispose() {
    // Nothing to do here;
  }
}
