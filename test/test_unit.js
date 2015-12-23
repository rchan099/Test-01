'use strict';

const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

lab.test('returns true when 1 + 1 equals 2', (done) => {
    Code.expect(1+1).to.equal(2);
    done();
});

// There is no way to cover this in node 0.10
// $lab:coverage:off$
lab.experiment('math', () => {
    lab.test('returns true when 1 + 1 equals 2', (done) => {
        Code.expect(1+1).to.equal(2);
        done();
    });
});
// $lab:coverage:on$

describe('math', () => {
    it('returns true when 1 + 1 equals 2', (done) => {
        expect(1+1).to.equal(2);
        done();
    });
});