import * as vscode from "vscode";
import * as path from "path";
import BaseDefinitionProvider, {DefinitionConfig, FileItem} from "./BaseDefinitionProvider";

const superModuleDefinitionConfig: DefinitionConfig = { 
  wordRangeRegex: /module\.superModule/g,
  identifyRegex: /module\.superModule/g,
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
  constructor(extensionConfig = {}, definitionConfig = superModuleDefinitionConfig) {
    super(extensionConfig, definitionConfig);
  }

  protected resolveCurrentCartridgeFilePath(fileItem: FileItem): Promise<string> {
    return Promise.resolve(null);
  }

  protected findCartridgeHierachyFilePaths(fileItem: FileItem): Promise<string[]> {
    const cartridgeDirPlusSeparator = this._extensionConfig.cartridgeDir + path.sep;
    const documentFileName = fileItem.documentFileName;
    const filePathBeginIndex = documentFileName.indexOf(cartridgeDirPlusSeparator)
      + (cartridgeDirPlusSeparator.length - 1);
    fileItem.path = documentFileName.substring(filePathBeginIndex).replace(/\\/g, "/");
    return super.findCartridgeHierachyFilePaths(fileItem);
  }
}
