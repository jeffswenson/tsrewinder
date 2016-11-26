import * as ts from "typescript";
import * as glob from "glob";

import {RewinderServiceHost, RewinderCompilerHost} from "./hosts";
import {findNodes} from "./astutil";

export interface FileTransform {
    (fileRoot : ts.Node, context : RunnerContext) : ts.TextChange [];
}

export interface NodeTransform {
    (node : ts.Node, context : RunnerContext) : ts.TextChange [];
}

export interface RunnerContext {
    languageService : ts.LanguageService,
    languageHost : ts.LanguageServiceHost,
    compilerHost : ts.CompilerHost,
    files : string []
}

export function createContext(globString : string) : RunnerContext {
    let files = glob.sync(globString);
    let compilerHost = new RewinderCompilerHost();
    let languageHost = new RewinderServiceHost(files, compilerHost);
    let languageService = ts.createLanguageService(languageHost);
    return {
        files,
        compilerHost,
        languageHost,
        languageService
    }
}

export function runFileTransform(transform : FileTransform, runnerContext : RunnerContext) {
    let edits : {[fileName:string]:ts.TextChange[]};
    for (let file of runnerContext.files) {
        //TODO Log Edits to the Console
    }
}

export function nodeToFileTransform(transform : NodeTransform, nodesMatching : (node : ts.Node) => boolean) : FileTransform {
    return function(fileRoot : ts.Node, context : RunnerContext) {
        let edits : ts.TextChange[] = [];

        for (let node of findNodes(fileRoot, nodesMatching)) {
            for (let edit of transform(node, context)) {
                edits.push(edit);
            }
        }

        return edits;
    }
}
