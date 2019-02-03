import * as vscode from "vscode";
import DefaultDefinitionProvider from "./DefaultDefinitionProvider";
import {DefinitionConfig, DefinitionItem, ResolvedLocation} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /('|")dw[a-zA-Z0-9_\/\*\.]*('|")/,
  identifySimpleSearch: "dw",
  identifyRegex: /(require\s*\(\s*)(['"])dw(.*?[^\\])\2\s*\)/,
  identifyMatchPathPosition: 4,
  identifyType: "requireDw",
  cartridgeFolder: "/dw-api-types/dw",
  simpleExportDefinitionStart: "declare class",
  symbolExportDefinitionRegex: /\s*declare class\s*[a-zA-Z0-9_-]+\s*{/,
  symbolExportExtractMethodRegexs: [
    /\s*readonly\s*([a-zA-Z0-9_-]+)\s*:/,
    /\s*static\s*([a-zA-Z0-9_-]+[\(]?[^\(]*[\)]?)\s*:/,
    /\s*([a-zA-Z0-9_-]+[\(]?[^\(]*[\)]?)\s*:/
  ]
};

/**
 * Definition Provider for dw types in "require" statements.
 * @example
 * var ArrayList = require('dw/util/ArrayList');
 * 
 */
export default class RequireDwDefinitionProvider extends DefaultDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = {}) {
    super(extensionConfig, definitionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, requireDefinitionConfig);
    super._providerClass = "RequireDw";
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    return Promise.resolve(null);
  }

  protected resolveExtension(definitionItem: DefinitionItem): string {
    return ".d.ts";
  }

  protected resolveCompletionType(resolvedLocation: ResolvedLocation): vscode.CompletionItemKind {
    let completionType = vscode.CompletionItemKind.Field;
    if (resolvedLocation.positionLabel.includes("(")) {
      completionType = vscode.CompletionItemKind.Function;
    }
    return completionType;
  }
}
