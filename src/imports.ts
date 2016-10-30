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
import "mocha";

import {findNodes} from './astutil';

export function findAllImports(ast : ts.Node) : ts.ImportDeclaration [] {
    return findNodes(ast, node => node.kind === ts.SyntaxKind.ImportDeclaration) as (ts.ImportDeclaration []);
}

/**
 * Produce the edits required to debundle the import.
 * @param  import Declaration that is being debundled.
 * @return Edits that should be applied.
 */
export function getEditsToDebundle(declaration : ts.ImportDeclaration) : ts.TextChange [] {
    let importFrom = (declaration.moduleSpecifier as ts.StringLiteral).text;
    let namedImports = findNodes(declaration, node => node.kind === ts.SyntaxKind.NamedImports);

    if (_isExternalModule(importFrom) || _isStaticImport(declaration) || namedImports.length === 0) {
        return [];
    }

    // Quit if it is an exteranl import
    // Quit if it is a static import

    // How to handle each type
    // Default - Pass it through unmodified
    // Namespace - Pass it through unmodified
    // Named - If it is declared in a different file, split it into its own import
    // Static - Ignore It

    // Find all identifiers being imported

    // For each import, determine where it is being imported from

    // Determine the imports in debundled form

    // Produce the edit required to delete the previous import and add the new import

    return [{}] as any;
}

export interface ImportFields {
    moduleName : string,
    defaultImport? : ImportedSymbol,
    namespaceImport? : ImportedSymbol,
    namedImports? : ImportedSymbol []
}

export interface ImportedSymbol {
    name : string,
    alias : string
}

export function importDeclarationToImportFields(declaration : ts.ImportDeclaration) {

}

export function importFieldsToString(fields : ImportFields) {
    let imports : string [] = [];

    if (fields.defaultImport) {
        imports.push(_importSymbol(fields.defaultImport));
    }

    if (fields.namespaceImport) {
        imports.push(_importSymbol(fields.namespaceImport));
    }

    if (fields.namedImports && fields.namedImports.length > 0) {
        let namedImports = fields.namedImports.map(_importSymbol);
        imports.push(`{${namedImports.join(", ")}}`);
    }

    if (imports.length === 0) {
        return `import '${fields.moduleName}'`;
    } else {
        return `import ${imports.join(", ")} from '${fields.moduleName}'`;
    }
}

function _importSymbol(importedSymbol : ImportedSymbol) {
    if (importedSymbol.alias && importedSymbol.alias !== importedSymbol.name) {
        return `${importedSymbol.name} as ${importedSymbol.alias}`;
    } else {
        return importedSymbol.name;
    }
}

function _isExternalModule(moduleName : string) {
    return moduleName.charAt(0) !== ".";
}

function _isStaticImport(declaration : ts.ImportDeclaration) {
    return !declaration.importClause;
}
