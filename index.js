'use strict';

function notEmpty(x) {
    return x;
}

var parseRegex;
function getParseRegex() {
    if (!parseRegex) {
        var accepted = [
            '\\-?\\d+(\\:\\-?\\d+)?', // Number range or lone number
            '(\\-?\\d+|\\$)\\:(\\-?\\d+|\\$)', // Ranges with infinity
            ',' // Range delimiter
        ];
        parseRegex = new RegExp('^(' + accepted.join('|') + ')*$');    
    }
    return parseRegex;
}

function parse(s) {
    if (typeof s !== 'string') {
        return null;
    }
    s = s.replace(/\s/g, ''); // Remove spaces that we want to ignore
    
    if (!getParseRegex().test(s)) {
        return null;
    }

    return s
        .split(',')
        .filter(notEmpty)
        .map(function(range) {
            var couple = range.split(':').filter(notEmpty);
            var res = {
                start: couple[0] === '$' ? -Infinity : parseFloat(couple[0])
            };
            if (couple[1]) {
                res.end = couple[1] === '$' ? +Infinity : parseFloat(couple[1]);
            }
            return res;
        });
}

function isInRange(item, ranges, key) {
    if (typeof ranges === 'string') {
        ranges = parse(ranges);
    }
    if (ranges === undefined || ranges === null || item === undefined || item === null) {
        return false;
    }
    if (key) {
    	item = item[key];
    }
    
    for (var index in ranges) {
        var range = ranges[index];
        if (item >= range.start && item <= (range.end || range.start)) {
           return true;   
        }
    }
    return false;
}

function isInRangeFilter(ranges, key) {
    if (typeof ranges === 'string') {
        ranges = parse(ranges);
    }
    return function(item) {
        return isInRange(item, ranges, key);
    };
}

module.exports = {
    parse: parse,
    isInRange: isInRange,
    isInRangeFilter: isInRangeFilter
};
