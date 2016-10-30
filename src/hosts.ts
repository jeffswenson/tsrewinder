import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

export function createServiceHost(fileGlob : string) {
    let files = glob.sync(fileGlob);
    return new RewinderServiceHost(files, new RewinderCompilerHost());
}

export class RewinderServiceHost implements ts.LanguageServiceHost {
        constructor(private _rootFiles : string[], private _compilerHost : ts.CompilerHost) {

        }

        getCompilationSettings() : ts.CompilerOptions {
            return {};
        }

        getScriptFileNames(): string[] {
            return this._rootFiles;
        }

        getScriptVersion(fileName: string): string {
            return "1.0";
        }

        getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
            if (!this._compilerHost.fileExists(fileName)) {
                return undefined;
            }

            return ts.ScriptSnapshot.fromString(this._compilerHost.readFile(fileName));
        }

        getCurrentDirectory(): string {
            return this._compilerHost.getCurrentDirectory();
        }

        getDefaultLibFileName(options: ts.CompilerOptions): string {
            return this._compilerHost.getDefaultLibFileName(options);
        }
}

export class RewinderCompilerHost implements ts.CompilerHost {

        writeFile: ts.WriteFileCallback = (fileName, content) => ts.sys.writeFile(fileName, content);

        getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
            const sourceText = ts.sys.readFile(fileName);
            return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined;
        }

        getDefaultLibFileName(options: ts.CompilerOptions): string {
            return "lib.d.ts";
        }

        getCurrentDirectory(): string {
            return ts.sys.getCurrentDirectory();
        }

        getDirectories(srcPath: string): string[] {
            return fs.readdirSync(srcPath).filter(function(file : string) {
                return fs.statSync(path.join(srcPath, file)).isDirectory();
            });
        }

        getCanonicalFileName(fileName: string): string {
            return this.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        }

        useCaseSensitiveFileNames(): boolean {
            return ts.sys.useCaseSensitiveFileNames;
        }

        getNewLine(): string {
            return "\n";
        }

        getEnvironmentVariable?(name: string): string {
            return process.env[name];
        }

        fileExists(fileName: string): boolean {
            return ts.sys.fileExists(fileName);
        }

        readFile(fileName: string): string {
            return ts.sys.readFile(fileName);
        }
}
