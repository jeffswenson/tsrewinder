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
    log : (text:string) => void,
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
        languageService,
        log : console.log
    }
}

export function runFileTransform(transform : FileTransform, runnerContext : RunnerContext) {
    let edits : {[fileName:string]:ts.TextChange[]} = {};
    let program = runnerContext.languageService.getProgram();

    for (let file of runnerContext.files) {
        let parsedFile = program.getSourceFile(file);
        let fileEdits = transform(parsedFile, runnerContext);

        if (fileEdits.length > 0) {
            edits[file] = fileEdits;
        }
    }

    return edits;
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
