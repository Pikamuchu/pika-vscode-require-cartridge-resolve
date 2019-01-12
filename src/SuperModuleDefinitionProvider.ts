import * as path from "path";
import BaseDefinitionProvider, {DefinitionConfig, DefinitionItem} from "./BaseDefinitionProvider";

const superModuleDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /module\.superModule/,
  identifyRegex: /module\.superModule/,
  identifyMatchPathPosition: 0,
  identifyType: "superModule"
};

/**
 * Definition Provider for scripts related to module.superModule statements.
 * @example
 * var base = module.superModule;
 * 
 */
export default class SuperModuleDefinitionProvider extends BaseDefinitionProvider {
  public constructor(extensionConfig = {}, definitionConfig = superModuleDefinitionConfig) {
    super(extensionConfig, definitionConfig);
  }

  protected resolveCurrentCartridgeFilePath(definitionItem: DefinitionItem): Promise<string> {
    return Promise.resolve(null);
  }

  protected findCartridgeHierachyFilePaths(definitionItem: DefinitionItem): Promise<string[]> {
    definitionItem.path = this.getSuperModulePath(definitionItem);
    return super.findCartridgeHierachyFilePaths(definitionItem);
  }

  protected getSuperModulePath(definitionItem: DefinitionItem): string {
    const cartridgeFolderPlusSeparator = this._definitionConfig.cartridgeFolder + path.sep;
    const documentFileName = definitionItem.documentFileName;
    const filePathBeginIndex = documentFileName.indexOf(cartridgeFolderPlusSeparator)
      + (cartridgeFolderPlusSeparator.length - 1);
    return documentFileName.substring(filePathBeginIndex).replace(/\\/g, "/");
  }
}
