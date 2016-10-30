import {expect} from "chai";
import "mocha";

import {parse} from "./astutil";

describe("parse", function() {
    it("Throws an error when passed invalid typescript", function() {
        expect(() => parse("import a,b from 'c'")).to.throw;
    });
});
