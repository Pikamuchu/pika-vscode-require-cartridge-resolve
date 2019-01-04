import * as path from "path";
import BaseDefinitionProvider, {DefinitionConfig, DefinitionItem} from "./BaseDefinitionProvider";

const requireDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /('|")dw[a-zA-Z0-9_\/\*\.]*('|")/g,
  identifyRegex: /(require\s*\(\s*)(['"])dw(.*?[^\\])\2\s*\)/g,
  identifyMatchPathPosition: 4,
  identifyType: "requireClient",
  cartridgeFolder: "/dw-api-types/dw"
};

/**
 * Definition Provider for dw types in "require" statements.
 * @example
 * var ArrayList = require('dw/util/ArrayList');
 * 
 */
export default class RequireClientDefinitionProvider extends BaseDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = requireDefinitionConfig) {
    super(extensionConfig, definitionConfig);
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    return Promise.resolve(null);
  }

  protected resolveExtension(definitionItem: DefinitionItem): string {
    return ".d.ts";
  }
}
