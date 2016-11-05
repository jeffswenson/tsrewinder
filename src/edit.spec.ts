import "mocha";
import {expect} from "chai";
import * as ts from "typescript";

import {replaceNode, applyEdits} from './edit';
import {parse, } from './astutil'

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
        let editA = {
            span : {
                start: "     PUTITHERE    ".length,
                length: "PUTITHERE".length
            },
            newText: "THIS"
        }

        expect(() => applyEdits("     PUTITHERE     ", [editA])).to.throw(Error);
    });

    it("thows if an edit ends out of range", function() {
        let editA = {
            span : {
                start: "     PUTITHERE    ".length - 1,
                length: 2
            },
            newText: "THIS"
        }
        expect(() => applyEdits("     PUTITHERE     ", [editA])).to.throw(Error);
    });
});

describe("replaceNode", function() {
    it("can replace imports", function() {

        expect(true).to.equal(false);
    });
});
