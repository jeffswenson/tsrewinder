import {expect} from 'chai';
import 'mocha';
import * as ts from 'typescript';

import {parse} from './astutil';
import {getEditsToDebundle} from './imports';

function toImportDeclaration(importText : string) : ts.ImportDeclaration {
    return parse(importText).statements[0] as ts.ImportDeclaration;
}

describe("debundleEdits", function() {
    it("Does not modify imports from an external library", function() {
        let declaration = toImportDeclaration('import {Foo as X, Foobar} from "externallib"');
        expect(getEditsToDebundle(declaration).length).to.equal(0);
    });

    it("Does not modify a static import", function() {
        let declaration = toImportDeclaration('import "./locallib"');
        expect(getEditsToDebundle(declaration).length).to.equal(0);
    });

    it("Does not modify a default import", function() {
        let declaration = toImportDeclaration('import Default from "./locallib"');
        expect(getEditsToDebundle(declaration).length).to.equal(0);
    });

    it("Returns edits for NamedImports", function() {
        let declaration = toImportDeclaration('import {A as B} from "./locallib"');
        expect(getEditsToDebundle(declaration).length).to.equal(1);
    });
});
