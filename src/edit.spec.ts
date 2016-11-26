import "mocha";
import {expect} from "chai";
import * as ts from "typescript";

import {replaceNode, applyEdits} from './edit';
import {parse, findNextNode} from './astutil'

describe("applyEdits", function() {
    it("returns the source string unmodified if there are no edits", function() {
        let text = "This is a string!"
        expect(applyEdits(text, [])).to.equal(text);
    });

    it("applies a signle edit correctly", function() {
        let edit = {
            span : {
                start: 5,
                length: "PUTITHERE".length
            },
            newText: "THIS"
        }
        expect(applyEdits("     PUTITHERE     ", [edit])).to.equal("     THIS     ");
    });

    it("sorts the edits before applying them", function() {
        let editB = {
            span : {
                start: 1,
                length: 4
            },
            newText: "_"
        }

        let editA = {
            span : {
                start: 5,
                length: "PUTITHERE".length
            },
            newText: "THIS"
        }

        expect(applyEdits("     PUTITHERE     ", [editA, editB])).to.equal(" _THIS     ");
        expect(applyEdits("     PUTITHERE     ", [editB, editA])).to.equal(" _THIS     ");
    });

    it("throws an exception if edits overlap", function() {
        let editB = {
            span : {
                start: 1,
                length: 7
            },
            newText: "_"
        }
        let editA = {
            span : {
                start: 5,
                length: "PUTITHERE".length
            },
            newText: "THIS"
        }

        expect(() => applyEdits("     PUTITHERE     ", [editA, editB])).to.throw(Error);
    });

    it("thows if an edit starts out of range", function() {
        let string = "     PUTITHERE    ";
        let editA = {
            span : {
                start: string.length + 1,
                length: 0
            },
            newText: "THIS"
        }

        expect(() => applyEdits(string, [editA])).to.throw(Error);
    });

    it("thows if an edit ends out of range", function() {
        let string = "     PUTITHERE     ";
        let editA = {
            span : {
                start: string.length - 1,
                length: 2
            },
            newText: "THIS"
        }
        expect(() => applyEdits(string, [editA])).to.throw(Error);
    });

    it("allows replacing an entire string", function() {
        let string = "THISISIT"
        let editA = {
            span : {
                start: 0,
                length: string.length
            },
            newText: "NOW"
        }
        expect(applyEdits(string, [editA])).to.equal("NOW");
    });
});

describe("replaceNode", function() {
    it("can replace imports", function() {
        let src = 'import Defult from "afile"';
        let node = findNextNode(parse(src), node => node.kind === ts.SyntaxKind.ImportDeclaration);
        let edit = replaceNode(node, "THIS");
        expect(applyEdits(src, [edit])).to.equal("THIS");
    });
});
