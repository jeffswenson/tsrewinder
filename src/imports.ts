/**
 * The utilities in this file are used to interact with imports.
 *
 * # Import Types
 * There are five styles of import. Four of them can be combined in a single import statement.
 *
 * ```
 * import Thing from 'somefile' // The Default Import
 * import {Thing} from 'somefile' // Generalized as NamedImport
 * import {Thing as Name} from 'somefile' // Generalized as NamedImport
 * import * as Name from 'somefile' // This is a NamespaceImport
 * import "somefile"; // Execute the file, but don't import any symbols. May pull in symbols if looking at a .d.ts.
 * ```
 *
 * Four of these can be combined into a single import statement.
 * ```
 * import DefaultImport, * as NamespaceImport, {NamedImport, NamedImport as Identifier} from 'stringliteral'
 * ```
 */

import * as ts from 'typescript';
import * as _ from "lodash";

import {getNodeText, findNodes, findNextNode} from './astutil';

export function findAllImports(ast : ts.Node) : ts.ImportDeclaration [] {
    return findNodes(ast, node => node.kind === ts.SyntaxKind.ImportDeclaration) as (ts.ImportDeclaration []);
}

/**
 * Produce the edits required to debundle the import.
 * @param  import Declaration that is being debundled.
 * @return Edits that should be applied.
 */
export function getEditsToDebundle(declaration : ts.ImportDeclaration, languageService : ts.LanguageService) : ts.TextChange [] {
    let importFrom = (declaration.moduleSpecifier as ts.StringLiteral).text;
    let currentFileName = declaration.getSourceFile().fileName;
    let namedImports = findNodes(declaration, node => node.kind === ts.SyntaxKind.ImportSpecifier) as ts.ImportSpecifier [];

    if (_isExternalModule(importFrom) || !_hasInternalBarreledImports(namedImports)) {
        return [];
    }

    let importStatements : string[] = [];
    let moduleSpecifier = declaration.moduleSpecifier;

    let defaultImport = declaration.importClause.name;
    if (defaultImport) {
        importStatements.push(`import ${getNodeText(defaultImport)} from ${getNodeText(moduleSpecifier)}`);
    }

    let namespaceImport = findNextNode(declaration, node => node.kind === ts.SyntaxKind.NamespaceImport) as ts.NamespaceImport;
    if (namespaceImport) {
        importStatements.push(`import ${getNodeText(namespaceImport)} from ${getNodeText(moduleSpecifier)}`);
    }

    let namedImportsByFile = _.groupBy(namedImports, s => _findSymbolSource(s, languageService) || currentFileName);
    for (var fileName in namedImportsByFile) {
        let importClause = `{${namedImportsByFile[fileName].join(", ")}}`;
        importStatements.push(`import ${importClause} from "${namedImportsByFile}"`);
    }

    //TODO convert to an edit
    return importStatements as any;
}

function _hasInternalBarreledImports(namedImports : ts.ImportSpecifier[]) {
    return namedImports.length > 0; //TODO : Update this so that it checks destination
}

function _findSymbolSource(specifier : ts.ImportSpecifier, languageService : ts.LanguageService) : string | null {
    let source : string = null;

    let file = specifier.getSourceFile().fileName;
    let position = specifier.pos;
    let declarations = languageService.getDefinitionAtPosition(file, position);

    if (declarations.length === 1) {
        source = declarations[0].fileName;
    }

    return source;
}

function _isExternalModule(moduleName : string) {
    return moduleName.charAt(0) !== ".";
}

function _isStaticImport(declaration : ts.ImportDeclaration) {
    return !declaration.importClause;
}
