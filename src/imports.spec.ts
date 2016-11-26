import {expect} from 'chai';
import 'mocha';
import * as ts from 'typescript';

import {parse} from './astutil';
import {getEditsToDebundle} from './imports';
import {applyEdits} from './edit';

function toImportDeclaration(importText : string) : ts.ImportDeclaration {
    return parse(importText).statements[0] as ts.ImportDeclaration;
}

class MockLanguageService {
    constructor(public getDefinitionAtPosition : any){}
}

describe("debundleEdits", function() {
    beforeEach(function() {
        this.mockService = new MockLanguageService((fileName : string) => [{fileName}] as any);
    });

    it("Does not modify imports from an external library", function() {
        let declaration = toImportDeclaration('import {Foo as X, Foobar} from "externallib"');
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(0);
    });

    it("Does not modify a static import", function() {
        let declaration = toImportDeclaration('import "./locallib"');
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(0);
    });

    it("Does not modify a default import", function() {
        let declaration = toImportDeclaration('import Default from "./locallib"');
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(0);
    });

    it("Doesn't touch a bundle if none of them are barreled", function() {
        let declaration = toImportDeclaration('import {A as B} from "./locallib"');
        this.mockService = new MockLanguageService(() => [{fileName: declaration.getSourceFile().fileName}]);
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(0);
    });

    it("Returns one edit for an import with a single barreled import", function() {
        this.mockService = new MockLanguageService(() => [{fileName : "./locallib/realsource.ts"}]);
        let declaration = toImportDeclaration('import {A as B} from "./locallib"');
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(1);
    });

    it("Switches one barreled import to the correct file", function() {
        this.mockService = new MockLanguageService(() => [{fileName : "./locallib/realsource.ts"}]);
        let sourceText = 'import {A as B} from "./locallib"';
        let declaration = toImportDeclaration(sourceText);
        let result = applyEdits(sourceText, getEditsToDebundle(declaration, this.mockService));
        expect(result).to.equal('import {A as B} from "./locallib/realsource.ts"');
    });

    it("Correctly handles an import with a defualt and multiple imports", function() {
        let sourceText = `import Default, {A as B, B as Bat, C as D} from "./locallib"`;

        this.mockService = new MockLanguageService((file : any, position : number) => {
            let fileName = "./locallib/a";
            let char = sourceText[position + 1]; // Position tends to includes the whitespace in front of the token.
            if (char === "C") {
                fileName = "./locallib/c";
            }
            return [{fileName}];
        });

        let declaration = toImportDeclaration(sourceText);
        let result = applyEdits(sourceText, getEditsToDebundle(declaration, this.mockService));

        let expected = [
            'import Default from "./locallib"',
            'import {A as B, B as Bat} from "./locallib/a"',
            'import {C as D} from "./locallib/c"'
        ].join("\n");

        expect(result).to.equal(expected);
    });
});
