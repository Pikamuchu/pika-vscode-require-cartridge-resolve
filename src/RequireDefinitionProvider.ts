import * as vscode from "vscode";
import BaseDefinitionProvider, {DefinitionConfig} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /('|")[\*~][a-zA-Z0-9_\/\*\.]*('|")/,
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
export default class RequireDefinitionProvider extends BaseDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = requireDefinitionConfig) {
    super(extensionConfig, definitionConfig);
    super._providerClass = "Require";
  }
}
