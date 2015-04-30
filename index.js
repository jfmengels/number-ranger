'use strict';

function notEmpty(x) {
    return x;
}

function parse(s) {
    if (typeof s !== 'string' || !/^[\d\,\-\: ]*$/.test(s)) {
        return null;
    }

    return s
        .replace(/\s/g, '')
        .split(',')
        .filter(notEmpty)
        .map(function(range) {
            var couple = range.split(':').filter(notEmpty);
            var res = {
                start: parseFloat(couple[0])
            };
            if (couple[1]) {
                res.end = parseFloat(couple[1]);
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
    return function(item) {
        return isInRange(item, ranges, key);
    };
}

module.exports = {
    parse: parse,
    isInRange: isInRange,
    isInRangeFilter: isInRangeFilter
};
