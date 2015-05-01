'use strict';

function notEmpty(x) {
    return x;
}

function parse(s) {
    if (typeof s !== 'string') {
        return null;
    }
    var ranges = s.replace(/\s/g, '') // Remove spaces that we want to ignore
        .split(',')
        .filter(notEmpty);

    var isOk = ranges.reduce(function(res, range) {
        return res && (/^\-?\d+(\:\-?\d+)?$/.test(range) || /^(\-?\d+|\$)\:(\-?\d+|\$)$/.test(range));
    }, true);

    if (!isOk) {
        return null;
    }

    return ranges
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
