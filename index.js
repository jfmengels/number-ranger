'use strict';

var ranger = {};

function notEmpty(x) {
    return x;
}

function escape(symbol) {
    // We need to know if we need to prepend by a \ (example: \!),
    // but we can't always do it as we shouldn't do it for some symbols like w (or we'll have \w).
    if ('[](){}\\/^$*?.!|+-'.indexOf(symbol) > -1) {
        return '\\' + symbol;
    }
    return symbol;
}

function prepareSymbols(customSymbols) {
    customSymbols = customSymbols || {};

    var areEmptyOrContainSpaces = Object.keys(customSymbols).map(function(key) {
        return customSymbols[key];
    }).reduce(function(prev, value) {
        return prev || !value || /\s/g.test(value);
    }, false);

    // Check if any of the symbols is an empty string or contains spaces
    if (areEmptyOrContainSpaces) {
        return null;
    }

    var symbols = {
        range: customSymbols.range || ':',
        separator: customSymbols.separator || ',',
        infinity: customSymbols.infinity || '$',
        exclude: customSymbols.exclude || 'x'
    };

    // Check if there are conflicts (multiple symbols with the same value)
    var symbolsKeys = Object.keys(symbols);
    var s = {};
    symbolsKeys.forEach(function(key) {
        s[symbols[key]] = true;
    });
    var duplicatesPresent = Object.keys(s).length !== symbolsKeys.length;

    if (duplicatesPresent) {
        return null;
    }
    return symbols;
}

ranger.parse = function(s, customSymbols) {
    if (typeof s !== 'string') {
        return null;
    }

    var symbols = prepareSymbols(customSymbols);
    if (!symbols) {
        // Something is wrong with the provided symbols
        return false;
    }

    var ranges = s.replace(/\s/g, '') // Remove spaces that we want to ignore
        .split(symbols.separator)
        .filter(notEmpty);

    // regex, which will be applied on every element of the range splitted by ',':
    var validRangeRegexString = 
          '^' // start of string
        + escape(symbols.exclude) + '?' // optionally don't include first value
        + '('
        + '   [+-]?' // optional sign character
        + '   ('
        + '       ('
        + '           \\d+' // 1 or more digits
        + '           (\\.\\d*)?' // eventually followed by a dot and eventually more digits
        + '       )'
        + '   |' // or
        + '       (\\.\\d+)' // dot followed by 1 or more digits
        + '   )'
        + '|' // or
        +     escape(symbols.infinity) // a dollar sign representing Infinity
        + ')'
        + '('
        +     escape(symbols.range) // a range symbol to indicate that this will be a range
                                    // followed by the same thing in part 1
        +     escape(symbols.exclude) + '?' // optionally don't include first value
        + '   ('
        + '       [+-]?' // optional sign character
        + '       ('
        + '           ('
        + '               \\d+'         // 1 or more digits
        + '               (\\.\\d*)?'   // eventually followed by a dot and eventually more digits
        + '           )'
        + '       |' // or
        + '           (\\.\\d+)'        // dot followed by 1 or more digits
        + '       )'
        + '   |' // or
        +         escape(symbols.infinity)
        + '   )'
        + ')?' // this second part is optional
        + '$'; // end of string

    // Create regex from previous construction (remove spaces as they were present for readability)
    var validRangeRegex = new RegExp(validRangeRegexString.replace(/\s/g, ''));
    var isValidRange = ranges.reduce(function(res, range) {
        return res && range !== symbols.infinity && range !== '.' && validRangeRegex.test(range);
    }, true);

    if (!isValidRange) {
        return null;
    }

    return ranges
        .map(function(range) {
            var couple = range.split(symbols.range).filter(notEmpty);
            var res = {};
            if (couple[0][0] === symbols.exclude) {
                res.startIncluded = false;
                couple[0] = couple[0].slice(1);
            }
            res.start = couple[0] === symbols.infinity ? -Infinity : parseFloat(couple[0])
            if (couple[1]) {
                if (couple[1][0] === symbols.exclude) {
                    res.endIncluded = false;
                    couple[1] = couple[1].slice(1);
                }
                res.end = couple[1] === symbols.infinity ? +Infinity : parseFloat(couple[1]);
            }
            return res;
        });
};

ranger.isInRange = function(item, ranges, key) {
    if (typeof ranges === 'string') {
        ranges = ranger.parse(ranges);
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

        if (item >= min && item <= max && !(range.startIncluded === false && item === min) && !(range.endIncluded === false && item === max)) {
            return true;
        }
    }
    return false;
};

ranger.isInRangeFilter = function(ranges, key) {
    if (typeof ranges === 'string') {
        ranges = ranger.parse(ranges);
    }
    return function(item) {
        return ranger.isInRange(item, ranges, key);
    };
};

module.exports = ranger;
