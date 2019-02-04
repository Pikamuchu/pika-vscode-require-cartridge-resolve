import * as vscode from "vscode";
import DefaultDefinitionProvider from "./DefaultDefinitionProvider";
import { DefinitionConfig, DefinitionItem, ResolvedLocation } from "./BaseDefinitionProvider";

const CLIENT_SCRIPTS_DEFAULT_ROOT = "/client/default/js";

const requireDefinitionConfig: DefinitionConfig = {
  wordRangeRegex: /('|")base[a-zA-Z0-9_\/\*\.]*('|")/,
  identifySimpleSearch: "base",
  identifyRegex: /(require\s*\(\s*)(['"])base(.*?[^\\])\2\s*\)/,
  identifyMatchPathPosition: 4,
  identifyType: "requireClient"
};

/**
 * Definition Provider for client scripts in "require" statements.
 * @example
 * var baseProductBase = require('base/product/base');
 *
 */
export default class RequireClientDefinitionProvider extends DefaultDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = {}) {
    super(extensionConfig, definitionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, requireDefinitionConfig);
    super._providerClass = "RequireClient";
  }

  protected resolveCurrentCartridgeFilePath(definitionItem: DefinitionItem): Promise<string> {
    return Promise.resolve(null);
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    definitionItem.path = this.getClientBasePath(definitionItem);
    return super.findCartridgeHierachyFilePaths(definitionItem);
  }

  protected getClientBasePath(definitionItem: DefinitionItem): string {
    return CLIENT_SCRIPTS_DEFAULT_ROOT + definitionItem.path;
  }

  protected processExtractedSymbolLabels(
    extractedSymbolLabels: ResolvedLocation[],
    resolvedDocument: vscode.TextDocument,
    resolvedLocations: any[]
  ) {
    extractedSymbolLabels.forEach(extractedSymbolLabel => {
      const label = extractedSymbolLabel.positionLabel;
      if (!label.startsWith("url") && !label.startsWith("error(") && !label.startsWith("success(")) {
        resolvedLocations.push(extractedSymbolLabel);
      }
    });
  }
}
