import {expect} from 'chai';
import "mocha";

import {createServiceHost} from './hosts';

describe("createServiceHost", function() {
    beforeEach(function() {
        this.host = createServiceHost("testdata/hosts/*.ts");
    });

    it("constructs a language service host with files matched by the glob", function() {
        expect(this.host._rootFiles.sort()).to.eql(['testdata/hosts/empty.ts', 'testdata/hosts/function.ts']);
    });
});
