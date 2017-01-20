import {expect} from 'chai';
import 'mocha';

import {runFileTransform} from './runner';

describe("runFileTransform", function() {

    beforeEach(function() {
        this.context = {
            languageService : {
                getProgram : () => {
                    return {getSourceFile : (file : any) => file}
                }
            }
        }
    });


    it("Runs the transform on every file in the glob and returns edits", function() {
        let transform = (ast : any, context : any) => {
            expect(context).to.equal(this.context);
            return [ast + "_GOOD"] as any;
        }
        this.context.files = ["A", "B", "C"];
        expect(runFileTransform(transform, this.context)).to.eql({
            "A" : ["A_GOOD"],
            "B" : ["B_GOOD"],
            "C" : ["C_GOOD"],
        });
    });
});

describe("nodeToFileTransform", function() {
    it("Takes a node transform and returns a file transform", function() {
        expect(false).to.equal(true);
    });
});
