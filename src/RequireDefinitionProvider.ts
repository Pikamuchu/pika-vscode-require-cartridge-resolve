import * as vscode from "vscode";
import BaseDefinitionProvider, {DefinitionConfig} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /require|('|")\*[a-zA-Z0-9_\/\*\.]*('|")/g,
  identifyRegex: /(require\s*\(\s*)(['"])\*\/cartridge(.*?[^\\])\2\s*\)/g,
  identifyMatchPathPosition: 4,
  identifyType: "require"
};

/**
 * Definition Provider for scripts in "require" statements.
 * @example
 * var collections = require('unicodeEscape('*')/cartridge/scripts/util/collections');
 * 
 */
export default class RequireDefinitionProvider extends BaseDefinitionProvider implements vscode.DefinitionProvider {
  constructor(extensionConfig = {}, definitionConfig = requireDefinitionConfig) {
    super(extensionConfig, definitionConfig);
  }
}
