'use strict';

var expect = require('chai').expect;

var ranger = require('../');

describe('parsing', function() {
    it('should return null if argument is not a string', function() {
        expect(ranger.parse(2)).to.be.null;
        expect(ranger.parse([1, 2, 3])).to.be.null;
        expect(ranger.parse(['must not be an array'])).to.be.null;
        expect(ranger.parse({})).to.be.null;
    });

    it('should return null when string contains unexpected characters', function() {
        expect(ranger.parse('a')).to.be.null;
        expect(ranger.parse('2-3,4:haha')).to.be.null;
        expect(ranger.parse('2;3')).to.be.null;
    });

    it('should return null when there are lonely ranges ("x:", ":x")', function() {
        expect(ranger.parse('2:3,7:')).to.be.null;
        expect(ranger.parse('2:3,:7')).to.be.null;
    });

    it('should return null when there are lonely $', function() {
        expect(ranger.parse('$')).to.be.null;
        expect(ranger.parse('$-')).to.be.null;
        expect(ranger.parse('-$')).to.be.null;
        expect(ranger.parse('3,-$,2')).to.be.null;
        expect(ranger.parse('3,$-,2')).to.be.null;
    });

    it('should return null when there are negative $ signes', function() {
        expect(ranger.parse('-$')).to.be.null;
        expect(ranger.parse('-$,3')).to.be.null;
    });

    it('should return null when values are attached', function() {
        expect(ranger.parse('$$')).to.be.null;
        expect(ranger.parse('$1')).to.be.null;
        expect(ranger.parse('2$')).to.be.null;
        expect(ranger.parse('--3')).to.be.null;
        expect(ranger.parse('4-5')).to.be.null;
    });

    it('should create empty range when string is empty', function() {
        expect(ranger.parse('')).to.deep.equal([]);
    });

    it('should create simple range when only one number is given', function() {
        expect(ranger.parse('2')).to.deep.equal([{
            start: 2
        }]);
    });

    it('should create a range between numbers when separated by a ":"', function() {
        expect(ranger.parse('3:10')).to.deep.equal([{
            start: 3,
            end: 10
        }]);
    });

    it('should create multiple ranges when separated by a ","', function() {
        expect(ranger.parse('2,3:10')).to.deep.equal([{
            start: 2
        }, {
            start: 3,
            end: 10
        }]);
    });

    it('should create negative ranges', function() {
        expect(ranger.parse('-400:-200,-50:100')).to.deep.equal([{
            start: -400,
            end: -200
        }, {
            start: -50,
            end: 100
        }]);
    });

    it('should accept explicit positive ranges ranges', function() {
        expect(ranger.parse('+200:+400,+50:100')).to.deep.equal([{
            start: 200,
            end: 400
        }, {
            start: 50,
            end: 100
        }]);
    });

    it('should ignore empty spaces', function() {
        expect(ranger.parse(' 2 , 3: 1 0 ')).to.deep.equal([{
            start: 2
        }, {
            start: 3,
            end: 10
        }]);
    });

    it('should ignore empty ranges', function() {
        expect(ranger.parse('2,3,,,')).to.deep.equal([{
            start: 2
        }, {
            start: 3
        }]);
    });

    it('should convert $ to -Infinity if at the start of a range', function() {
        expect(ranger.parse('$:0')).to.deep.equal([{
            start: -Infinity,
            end: 0
        }]);
    });

    it('should convert $ to +Infinity if at the end of a range', function() {
        expect(ranger.parse('0:$')).to.deep.equal([{
            start: 0,
            end: +Infinity
        }]);
    });

    it('should convert "$:$" to -Infinity:+Infinity', function() {
        expect(ranger.parse('$:$')).to.deep.equal([{
            start: -Infinity,
            end: +Infinity
        }]);
    });

    it('should reject -$', function() {
        expect(ranger.parse('-$')).to.be.null;
        expect(ranger.parse('-$:$')).to.be.null;
        expect(ranger.parse('$:-$')).to.be.null;
        expect(ranger.parse('-$:-$')).to.be.null;
    });

    it('should accept handle decimals', function() {
        expect(ranger.parse('2.4')).to.deep.equal([{
            start: 2.4
        }]);

        expect(ranger.parse('0.002:2.0,700.45')).to.deep.equal([{
            start: 0.002,
            end: 2
        }, {
            start: 700.45
        }]);

        expect(ranger.parse('2.')).to.deep.equal([{
            start: 2
        }]);

        expect(ranger.parse('.2')).to.deep.equal([{
            start: 0.2
        }]);

        expect(ranger.parse('.')).to.be.null;
        expect(ranger.parse('..')).to.be.null;
    });

    it('should create range with start being higher than end', function() {
        expect(ranger.parse('4:2')).to.deep.equal([{
            start: 4,
            end: 2
        }]);
    });

    it('should not include value if it is prepended range by a \'!\'', function() {
        expect(ranger.parse('!217:548')).to.deep.equal([{
            start: 217,
            end: 548,
            startIncluded: false
        }]);

        expect(ranger.parse('217:!548')).to.deep.equal([{
            start: 217,
            end: 548,
            endIncluded: false
        }]);

        expect(ranger.parse('!217:!548')).to.deep.equal([{
            start: 217,
            end: 548,
            startIncluded: false,
            endIncluded: false
        }]);

        expect(ranger.parse('!217')).to.deep.equal([{
            start: 217,
            startIncluded: false
        }]);

        expect(ranger.parse('!$:217')).to.deep.equal([{
            start: -Infinity,
            end: 217,
            startIncluded: false
        }]);

        expect(ranger.parse('217:!$')).to.deep.equal([{
            start: 217,
            end: +Infinity,
            endIncluded: false
        }]);
    });

    it('should not accept multiple \'!\' signs', function() {
        expect(ranger.parse('!!2:4')).to.be.null;
        expect(ranger.parse('2:!!4')).to.be.null;
        expect(ranger.parse('!!2')).to.be.null;
    });
});


describe('isInRange', function() {
    it('should return false if ranges is empty array', function() {
        expect(ranger.isInRange(400, [])).to.be.false;
    });

    it('should return false if ranges is not an array', function() {
        expect(ranger.isInRange(402, {
            start: 400,
            end: 405
        })).to.be.false;
    });

    it('should return true when item equals range.start', function() {
        expect(ranger.isInRange(400, [{
            start: 400,
            end: 405
        }])).to.be.true;
    });

    it('should return true when item equals range.start and range.end doesn\'t exist', function() {
        expect(ranger.isInRange(400, [{
            start: 400
        }])).to.be.true;
    });

    it('should return true when item equals range.end', function() {
        expect(ranger.isInRange(405, [{
            start: 400,
            end: 405
        }])).to.be.true;
    });

    it('should return true when item is a decimal but included in the range', function() {
        expect(ranger.isInRange(402.5, [{
            start: 400,
            end: 405
        }])).to.be.true;
    });

    it('should return false when item is not included in range', function() {
        expect(ranger.isInRange(100, [{
            start: 400,
            end: 405
        }])).to.be.false;
    });

    it('should return false when item does not equal range.start and range.end doesn\'t exist', function() {
        expect(ranger.isInRange(100, [{
            start: 400
        }])).to.be.false;
    });

    it('should return true when item is in at least one of the ranges', function() {
        expect(ranger.isInRange(550, [{
            start: 400,
            end: 405
        }, {
            start: 500,
            end: 600
        }])).to.be.true;
    });

    it('should accept item to equal 0', function() {
        expect(ranger.isInRange(0, [{
            start: 0,
            end: 10
        }])).to.be.true;
    });

    it('should understand Infinity values', function() {
        expect(ranger.isInRange(0, [{
            start: -Infinity,
            end: 10
        }])).to.be.true;

        expect(ranger.isInRange(0, [{
            start: -10,
            end: +Infinity
        }])).to.be.true;

        expect(ranger.isInRange(100, [{
            start: -Infinity,
            end: 10
        }])).to.be.false;

        expect(ranger.isInRange(-100, [{
            start: -10,
            end: +Infinity
        }])).to.be.false;
    });

    it('should accept strings as ranges, to be understood with parse', function() {
        expect(ranger.isInRange(402, '400:405')).to.be.true;
    });

    it('should accept a key to look at a specific field of the item when it is an object', function() {
        expect(ranger.isInRange({
            keyValue: 402
        }, '400:405', 'keyValue')).to.be.true;
        expect(ranger.isInRange({
            keyValue: 0
        }, '400:405', 'keyValue')).to.be.false;
    });

    it('should return true when item equals range.start and range.start equals range.end', function() {
        expect(ranger.isInRange(400, [{
            start: 400,
            end: 400
        }])).to.be.true;
    });

    it('should return false when item doesn\'t equal range.start and range.start equals range.end', function() {
        expect(ranger.isInRange(-400, [{
            start: 400,
            end: 400
        }])).to.be.false;

        expect(ranger.isInRange(2, [{
            start: 400,
            end: 400
        }])).to.be.false;
    });

    it('should have the same results when start > end than when start < end', function() {
        var startLower = [{
                start: 2,
                end: 4
            }],
            startHigher = [{
                start: 4,
                end: 2
            }];

        [null, 3, 2, 4, -2, -Infinity, +Infinity].forEach(function(value) {
            expect(ranger.isInRange(value, startHigher)).to.equal(ranger.isInRange(value, startLower));
        })
    });

    it('should not include start if start is not included', function() {
        var range = {
            start: 2,
            end: 10,
            startIncluded: false
        };
        expect(ranger.isInRange(0, [range])).to.be.false;
        expect(ranger.isInRange(2, [range])).to.be.false;
        expect(ranger.isInRange(2.000002, [range])).to.be.true;
        expect(ranger.isInRange(8, [range])).to.be.true;
        expect(ranger.isInRange(10, [range])).to.be.true;
        expect(ranger.isInRange(10.00002, [range])).to.be.false;
    });

    it('should not include end if end is not included', function() {
        var range = {
            start: 2,
            end: 10,
            endIncluded: false
        };
        expect(ranger.isInRange(0, [range])).to.be.false;
        expect(ranger.isInRange(2, [range])).to.be.true;
        expect(ranger.isInRange(2.000002, [range])).to.be.true;
        expect(ranger.isInRange(8, [range])).to.be.true;
        expect(ranger.isInRange(10, [range])).to.be.false;
        expect(ranger.isInRange(10.00002, [range])).to.be.false;
    });

    it('should not include item if range.start === range.end and one is not included', function() {
        expect(ranger.isInRange(2, [{
            start: 2,
            end: 2,
            endIncluded: false
        }])).to.be.false;

        expect(ranger.isInRange(2, [{
            start: 2,
            end: 2,
            startIncluded: false
        }])).to.be.false;

        expect(ranger.isInRange(2, [{
            start: 2,
            startIncluded: false
        }])).to.be.false;

        expect(ranger.isInRange(2, [{
            start: 2,
            endIncluded: false
        }])).to.be.false;
    });

    it('should include Infinity values, unless not included', function() {
        expect(ranger.isInRange(+Infinity, [{
            start: 2,
            end: +Infinity
        }])).to.be.true;

        expect(ranger.isInRange(+Infinity, [{
            start: 2,
            end: +Infinity,
            endIncluded: false
        }])).to.be.false;
    });
});

describe('isInRangeFilter', function() {
    it('should filter out items not in range', function() {
        var ranges = [{
            start: 0,
            end: 4
        }, {
            start: 10
        }, {
            start: 8
        }];
        var res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .filter(ranger.isInRangeFilter(ranges));
        expect(res).to.deep.equal([0, 1, 2, 3, 4, 8, 10]);
    });

    it('should accept strings as ranges, to be understood with parse', function() {
        var res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .filter(ranger.isInRangeFilter('0:4,10,8'));
        expect(res).to.deep.equal([0, 1, 2, 3, 4, 8, 10]);
    });

    it('should accept a key to look at a specific field of the item when it is an object', function() {
        var res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .map(function(val) {
                return {
                    value: val
                };
            })
            .filter(ranger.isInRangeFilter('2:5', 'value'));
        expect(res).to.deep.equal([{
            value: 2
        }, {
            value: 3
        }, {
            value: 4
        }, {
            value: 5
        }]);
    });
});
