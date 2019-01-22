import DefaultDefinitionProvider from "./DefaultDefinitionProvider";
import {DefinitionConfig, DefinitionItem} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /('|")dw[a-zA-Z0-9_\/\*\.]*('|")/,
  identifyRegex: /(require\s*\(\s*)(['"])dw(.*?[^\\])\2\s*\)/,
  identifyMatchPathPosition: 4,
  identifyType: "requireDw",
  cartridgeFolder: "/dw-api-types/dw"
};

/**
 * Definition Provider for dw types in "require" statements.
 * @example
 * var ArrayList = require('dw/util/ArrayList');
 * 
 */
export default class RequireDwDefinitionProvider extends DefaultDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = requireDefinitionConfig) {
    super(extensionConfig, definitionConfig);
    super._providerClass = "RequireDw";
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    return Promise.resolve(null);
  }

  protected resolveExtension(definitionItem: DefinitionItem): string {
    return ".d.ts";
  }
}
