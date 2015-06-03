'use strict';

var expect = require('chai').expect;

var ranger = require('../');

describe('README examples', function() {
    it('ranger.parse returns as expected', function() {
        var res;

        res = ranger.parse('2');
        expect(res).to.deep.equal([{ start : 2 }]);

        res = ranger.parse('2:3');
        expect(res).to.deep.equal([{ start : 2, end: 3 }]);

        res = ranger.parse('2:3,4');
        expect(res).to.deep.equal([{ start : 2, end: 3 }, { start: 4 }]);

        res = ranger.parse('.002:.4');
        expect(res).to.deep.equal([{ start : .002, end: .4 }]);

        res = ranger.parse('2:$');
        expect(res).to.deep.equal([{ start : 2, end: +Infinity }]);

        res = ranger.parse('$:2');
        expect(res).to.deep.equal([{ start : -Infinity, end: 2 }]);

        res = ranger.parse('x2:4');
        expect(res).to.deep.equal([{ start : 2, end: 4, startIncluded: false }]);

        res = ranger.parse('2:x4');
        expect(res).to.deep.equal([{ start : 2, end: 4, endIncluded: false }]);

        res = ranger.parse('2p}4?-47p%', {
            range: 'p',
            separator: '?',
            infinity: '%',
            exclude: '}'
        });
        expect(res).to.deep.equal([{
            start: 2,
            end: 4,
            endIncluded: false
        }, {
            start: -47,
            end: +Infinity
        }]);

        res = ranger.parse('3', {
            range: '',
            separator: '   p',
            infinity: 'x'
        });
        expect(res).to.be.false;
    });

    it('ranger.isInRange returns as expected', function() {
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

        res = ranger.isInRange(450, [{
            start: 500,
            end: 400
        }]);
        expect(res).to.be.true;

        res = ranger.isInRange(2, [{
            start: 2,
            end: 5,
            startIncluded: false
        }]);
        expect(res).to.be.false;
    });

    it('ranger.isInRangeFilter returns as expected', function() {
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
