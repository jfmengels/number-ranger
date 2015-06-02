# number-ranger
[![NPM version](http://img.shields.io/npm/v/number-ranger.svg?style=flat)](https://www.npmjs.com/package/number-ranger)
[![Build Status](https://travis-ci.org/jfmengels/number-ranger.png)](https://travis-ci.org/jfmengels/number-ranger)
[![Dependencies Status](http://img.shields.io/david/jfmengels/number-ranger.svg?style=flat)](https://david-dm.org/jfmengels/number-ranger#info=dependencies)
[![devDependencies Status](http://img.shields.io/david/dev/jfmengels/number-ranger.svg?style=flat)](https://david-dm.org/jfmengels/number-ranger#info=devDependencies)

Interpret ranges from strings and use them easily.

# Install

Install via npm:
```
npm install number-ranger
```

# API

## ranger.parse(s)

Parses and transforms a string into a easily usable range.

```js
var ranger = require('number-ranger');

ranger.parse('2');
// --> [{ start : 2 }]

// Add ':' to make a range between two numbers
ranger.parse('2:3');
// --> [{ start : 2, end: 3 }]

// Create multiple ranges by separating them by ','
ranger.parse('2:3,4');
// --> [{ start : 2, end: 3 }, { start: 4 }]

// Floating numbers are fine
ranger.parse('.002:.4');
// --> [{ start : .002, end: .4 }]

// -/+ infinity is represented by $
ranger.parse('2:$');
// --> [{ start : 2, end: +Infinity }]
ranger.parse('$:2');
// --> [{ start : -Infinity, end: 2 }]

// Exclude bounds by prepending by !
ranger.parse('!2:4');
// --> [{ start : 2, end: 4, startIncluded: false }]
ranger.parse('2:!4');
// --> [{ start : 2, end: 4, endIncluded: false }]
```

## ranger.isInRange(item, ranges[, key])

Checks if item is in the given ranges.
Ranges can be a string as given for `#ranger.parse(s)`, or the result of it.
A key can also be provided when item is not a number but an object, and the value of item[key] will then be compared.

```js
var ranger = require('number-ranger');

// Pass the result of ranger.range
ranger.isInRange(325, ranger.parse('300:350'));
// --> true

// or ranger.ranger will be used implicitly
ranger.isInRange(450, '400:450');
// --> true

ranger.isInRange(0, '400:450');
// --> false

ranger.isInRange(450, [{
    start: 400,
    end: 500
}]);
// --> true

// By specifying a field, it will consider item to be an object and use item[key] as the value
ranger.isInRange({ value: 450 }, '400:450', 'value');
// --> true

// The order of start and end are not important
ranger.isInRange(450, [{
    start: 500,
    end: 400
}]);
// --> true

// You can exclude bounds
ranger.isInRange(2, [{
    start: 2,
    end: 5,
    startIncluded: false
}]);
// --> false
```

## ranger.isInRangeFilter(ranges[, key])

Returns an easy filter function that removes items that wouldn't match `ranger.isInRange(item, ranges)`.
Ranges can be a string as given for `#ranger.parse(s)`, or the result of it.
A key can also be provided when item is not a number but an object, and the value of item[key] will then be compared.

```js
var ranger = require('number-ranger');

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(ranger.isInRangeFilter([{
    start: 0,
    end: 5
}]));
// --> [0, 1, 2, 3, 4, 5]

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(ranger.isInRangeFilter('0:4'));
// --> [0, 1, 2, 3, 4]

[{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }].filter(ranger.isInRangeFilter('1:3', 'value'));
// --> [{ value: 1 }, { value: 2 }, { value: 3 }]
```
