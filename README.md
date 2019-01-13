# [Require Cartridge Resolve](https://github.com/pikamachu/pika-vscode-require-cartridge-resolve)

[![Version](https://vsmarketplacebadge.apphb.com/version/pikamachu.require-cartridge-resolve.svg)](https://marketplace.visualstudio.com/items?itemName=pikamachu.require-cartridge-resolve)
[![Build Status](https://img.shields.io/travis/pikamachu/pika-vscode-require-cartridge-resolve/master.svg)](https://travis-ci.org/pikamachu/pika-vscode-require-cartridge-resolve)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7a5d465f487e4f55a8e50e8201cc69b1)](https://www.codacy.com/project/antonio.marin.jimenez/pika-vscode-require-cartridge-resolve/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pikamachu/pika-vscode-require-cartridge-resolve&amp;utm_campaign=Badge_Grade_Dashboard)

## Introduction

Provides definitions for SFRA cartridge require files in your code for quick navigation.

## Features

- Adds quick navigation features to cartridge script and isml files.
- Resolves simple cartridge hierarchy.
- Supports the following statements definitions:
  - require('*/cartridge/...')
  - require('~/cartridge/...') (sitegenesis)
  - require('base/...')
  - require('dw/...') (using "dw-api-types" repository definitions)
  - module.superModule

## Usage

Open the folder containing the cartridges you want to work. This extension only resolves the cartridge hierachy inside this folder.

You can navigate to the cartridge file in 2 ways:

- Set your cursor inside to the cartridge file name string. Wait for resolution (a hover popup will appear with definition info) and click F12.
- Hold CMD or CTRL key and hover over the cartridge file name. Wait for resolution (a hover popup will appear with definition info) and mouse click. It also will become underlined and it will show the popup with the code lens.

You can also navigate to the cartridge symbols definitions in 2 ways:

- Set your cursor over a cartridge symbol reference. Wait for resolution (a hover popup will appear with definition info) and click F12.
- Hold CMD or CTRL key and hover over a cartridge symbol reference. Wait for resolution (a hover popup will appear with definition info) and mouse click. It also will become underlined and it will show the popup with the code lens.

### Notes
- The "dw-api-types" definitions are resolved using  git@github.com:SalesforceCommerceCloud/dw-api-types.git repository. Download it to the workspace folder that contains the cartridges.

## Changelist

### 1.4.0

- Adding basic go to symbol support

### 1.3.0

- Adding support for dw-api-types.
- Adding support for sitegenesis requires.

### 1.2.0

- Using code lens for multiple definition results.
- Implementing hover provider support.
- Implementing client require statement.
- Using DefinitionLink interface as definition result.
- Tests are now executed on travis CI.

### 1.1.0

- Adding module.superModule statement definition support.

### 1.0.0

- Initial release

## Configuration

You can configure this plugin via the "require.cartridge.resolve" properties in your workspace/user preferences.
