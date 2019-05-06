import * as vscode from "vscode";
import RequireDwDefinitionProvider from "./RequireDwDefinitionProvider";
import {DefinitionConfig, DefinitionItem, ResolvedLocation} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = {
  wordRangeRegex: /({)dw[a-zA-Z0-9_\/\*\.]*(})/,
  identifySimpleSearch: "dw",
  identifyRegex: /(@param)\s*{\s*(dw.*?[^\\])\s*}/,
  identifyMatchPathPosition: 3,
  identifyType: "jsDocDw",
  cartridgeFolder: "/dw-api-types/",
  simpleExportDefinitionStart: "class",
  symbolExportDefinitionRegex: /^\s*declare class\s*/,
  symbolExportExtractMethodRegexs: [
    /^\s*readonly\s*([a-zA-Z0-9_-]+)\s*:/,
    /^\s*static\s*([a-zA-Z0-9<>_-]+.*)\s*:/,
    /^\s*([a-zA-Z0-9<>_-]+.*)\s*:/
  ]
};

/**
 * Definition Provider for dw types in jsDoc params.
 * @example
 *
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 *
 */
export default class JSDocDwDefinitionProvider extends RequireDwDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = {}) {
    super(extensionConfig, definitionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, requireDefinitionConfig);
    super._providerClass = "JSDocDw";
  }

  protected processIdentifyMatchPath(path: string): string {
    return path.includes("dw.") ? path.replace(/\./g, "/") : path;
  }

  protected identifySimpleSearch(lineText: string, referenceName: string): boolean {
    return (
      lineText &&
      lineText.includes(this._definitionConfig.identifySimpleSearch) &&
      lineText.includes(referenceName) &&
      new RegExp("\\s*@param\\s+.*" + referenceName + "\\s+").test(lineText)
    );
  }
}
