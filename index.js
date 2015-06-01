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

    // regex, which will be applied on every element of the range splitted by ',':
    //  ^   start of string
    //  (
    //      [+-]?           optional sign character
    //      (
    //          \d+         1 or more digits
    //          (\.\d*)?)   eventually followed by a dot and eventually more digits
    //      |               or
    //          (\.\d+)     dot followed by 1 or more digits
    //      )
    //  |   or
    //      \$  a dollar sign representing Infinity
    //  )
    //  (
    //     \:  a colon to indicate that this will be a range
    //         followed by the same thing in part 1
    //     (
    //         [+-]?           optional sign character
    //         (
    //             \d+         1 or more digits
    //             (\.\d*)?)   eventually followed by a dot and eventually more digits
    //         |               or
    //             (\.\d+)     dot followed by 1 or more digits
    //         )
    //     |   or
    //         \$  a dollar sign representing Infinity
    //     )
    //  )?   this second part is optional
    //  $    end of string
    var validRangeRegex = /^([+-]?((\d+(\.\d*)?)|(\.\d+))|\$)(\:([+-]?((\d+(\.\d*)?)|(\.\d+))|\$))?$/;
    var isValidRange = ranges.reduce(function(res, range) {
        return res && range !== '$' && range !== '.' && validRangeRegex.test(range);
    }, true);

    if (!isValidRange) {
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
        var min, max;
        if (!range.end) {
            min = max = range.start;
        } else if (range.start <= range.end) {
            min = range.start;
            max = range.end;
        } else {
            min = range.end;
            max = range.start;
        }
        if (item >= min && item <= max) {
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
