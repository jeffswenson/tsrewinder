import * as ts from "typescript";

import {createDefaultFormatCodeOptions} from './format';
import {createServiceHost} from './hosts';
import {findAllImports} from './imports';

export function main() {
    let host = createServiceHost('testdata/main/**/*.ts');
    let languageService = ts.createLanguageService(host);
    let program = languageService.getProgram();
    let file = program.getSourceFile('testdata/main/import.ts');
    return findAllImports(file);
}

export function getProgram(glob : string = 'testdata/main/**/*.ts') {
    let host = createServiceHost(glob);
    let languageService = ts.createLanguageService(host);
    let program = languageService.getProgram();
    return program;
}

export function getThings() {
    //things = require('./dist/main').getThings(); host = things[0]; service = things[1]; program = things[2]; file = things[3]; findAllImports = things[4];
    let host = createServiceHost('testdata/main/**/*.ts');
    let languageService = ts.createLanguageService(host);
    let program = languageService.getProgram();
    let file = program.getSourceFile('testdata/main/import.ts');
    return [host, languageService, program, file, findAllImports];
}

/**
 * Unbundle all TS files found in the glob.
 * @param  glob Glob accepted by node glob.
 * @return Promise that resolves to the result of the refractor.
 */
export function unbundleGlob(glob : string) {

}

export function unbundleFile(filePath : string) {
    //Determine what is imported from where.
    //Produce a string that is the unundled imports.
    //Produce edits to remove all existing import.
    //Produce edit to add all imports to top of file.
}

/**
 * Given a symbol imported from the file determine the true location of the symbol.
 * @param  symbol Symbol that was imported.
 * @param  from File the symbol is imported from.
 */
export function whereIs(symbol : string, from : string) {

}
