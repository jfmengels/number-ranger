'use strict';

var expect = require('chai').expect;

var ranger = require('../');

describe('README examples', function() {
    it('ranger.parse return as expected', function() {
        var res;

        res = ranger.parse('2');
        expect(res).to.deep.equal([{ start : 2 }]);

        res = ranger.parse('2:3');
        expect(res).to.deep.equal([{ start : 2, end: 3 }]);

        res = ranger.parse('2:3,4');
        expect(res).to.deep.equal([{ start : 2, end: 3 }, { start: 4 }]);

        res = ranger.parse('2:$');
        expect(res).to.deep.equal([{ start : 2, end: +Infinity }]);

        res = ranger.parse('$:2');
        expect(res).to.deep.equal([{ start : -Infinity, end: 2 }]);
    });

    it('ranger.isInRange return as expected', function() {
        var res;

        res = ranger.isInRange(325, ranger.parse('300:350'));
        expect(res).to.be.true;

        res = ranger.isInRange(450, '400:450');
        expect(res).to.be.true;

        res = ranger.isInRange(0, '400:450');
        expect(res).to.be.false;

        res = ranger.isInRange({ value: 450 }, '400:450', 'value');
        expect(res).to.be.true;

        res = ranger.isInRange(450, [{
            start: 400,
            end: 500
        }]);
        expect(res).to.be.true;
    });

    it('ranger.isInRangeFilter return as expected', function() {
        var res;

        res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(ranger.isInRangeFilter([{
            start: 0,
            end: 5
        }]));
        expect(res).to.deep.equal([0, 1, 2, 3, 4, 5]);

        res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(ranger.isInRangeFilter('0:4'));
        expect(res).to.deep.equal([0, 1, 2, 3, 4]);

        res = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }].filter(ranger.isInRangeFilter('1:3', 'value'));
        expect(res).to.deep.equal([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });
});
