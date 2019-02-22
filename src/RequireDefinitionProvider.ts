import * as vscode from "vscode";
import DefaultDefinitionProvider from "./DefaultDefinitionProvider";
import { DefinitionConfig, ResolvedLocation } from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = {
  wordRangeRegex: /('|")[\*~][a-zA-Z0-9_\/\*\.]*('|")/,
  identifySimpleSearch: "cartridge",
  identifyRegex: /(require\s*\(\s*)(['"])[\*~]\/cartridge(.*?[^\\])\2\s*\)/,
  identifyMatchPathPosition: 4,
  identifyType: "require"
};

/**
 * Definition Provider for scripts in "require" statements.
 * @example
 * var collections = require('unicodeEscape('*')/cartridge/scripts/util/collections');
 *
 */
export default class RequireDefinitionProvider extends DefaultDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = {}) {
    super(extensionConfig, definitionConfig);
    this._definitionConfig = Object.assign(this._definitionConfig, requireDefinitionConfig);
    super._providerClass = "Require";
  }

  protected processExtractedSymbolLabels(
    extractedSymbolLabels: ResolvedLocation[],
    resolvedDocument: vscode.TextDocument,
    resolvedLocations: any[]
  ) {
    extractedSymbolLabels.forEach(extractedSymbolLabel => {
      const extractedSymbolDefinitions = this.searchDocumentSymbolsDefinitions(
        resolvedDocument,
        extractedSymbolLabel.positionLabel,
        extractedSymbolLabel.filePath
      );
      if (extractedSymbolDefinitions && extractedSymbolDefinitions.length > 0) {
        let extractedSymbolDefinition = extractedSymbolDefinitions[0];
        extractedSymbolDefinition.positionLabel = extractedSymbolDefinition.positionText
          .replace(/\s*(var|const|let)\s+/, "")
          .replace(/\s*function\s+/, "")
          .replace(/\s+=.*/, "")
          .replace(/\s*{/, "")
          .replace(/\s+$/, "")
          .replace(/\($/, "(...)");
        resolvedLocations.push(extractedSymbolDefinition);
      }
    });
  }
}
