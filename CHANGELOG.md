# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
Nothing yet.

## [2.0.0] - 2015-06-04
### Changed
- [Breaking change] Default exclusion symbol when parsing from '!' to 'x', as it caused unwanted behavior in a bash environment.

### Added
- New argument in the parse function, allowing to specify your own symbols.

## [1.1.0] - 2015-06-03
### Added
- Exclusion symbol '!' that excludes one or both of a range item's bounds from the range.
- Support for decimal numbers

## [1.0.4] - 2015-05-04
### Added
- Automatic builds on Travis.

## [1.0.3] - 2015-06-03
### Fixed
- Moved dev dependencies out of dependencies and into devDependencies in package.json.

## [1.0.2] - 2015-04-30
### Changed
- Regex to better detect odd strings on parsing.

## [1.0.1] - 2015-04-30
### Added
- parse method to parse a string and create a range.
- isInRange method to find out whether an item is in a range.
- isInRangeFilter method that returns a filter function using isInRange.

## [1.0.0] - 2015-04-30
### Created
- Project shell.
