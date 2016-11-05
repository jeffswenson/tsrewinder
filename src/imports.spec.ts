import {expect} from 'chai';
import 'mocha';
import * as ts from 'typescript';

import {parse} from './astutil';
import {getEditsToDebundle} from './imports';

function toImportDeclaration(importText : string) : ts.ImportDeclaration {
    return parse(importText).statements[0] as ts.ImportDeclaration;
}

class MockLanguageService {
    constructor(public getDefinitionAtPosition : any){}
}

describe("debundleEdits", function() {
    beforeEach(function() {
        this.mockService = new MockLanguageService(() => [] as any);
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
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(0);
    });

    it("Switches a single barreled import to the correct file", function() {
        this.mockService = new MockLanguageService(() => [{fileName : "./locallib/realsource.ts"}]);
        let declaration = toImportDeclaration('import {A as B} from "./locallib"');
        expect(getEditsToDebundle(declaration, this.mockService).length).to.equal(1);
    });
});
