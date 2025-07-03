# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2025-07-02

### Added
- New `delete_column` tool for removing columns from existing tables
- Support for deleting columns by either column ID or column name
- Comprehensive test coverage for column deletion functionality

### Fixed
- Enhanced `addColumn` method in NocoDBClient to properly extract the newly created column from the API response
- Added proper handling for the table object response from the column creation endpoint

### Changed
- Updated README with documentation and examples for the `delete_column` tool

## [0.2.0] - 2025-07-02

### Added
- New `add_column` tool for dynamically adding columns to existing tables
- Support for all major NocoDB column types including:
  - Basic types (SingleLineText, LongText, Number, Decimal, Checkbox)
  - Date/Time types (Date, DateTime, Duration)
  - Specialized types (Email, PhoneNumber, URL, Currency, Percent, Rating)
  - Selection types (SingleSelect, MultiSelect with options)
  - Advanced types (JSON, Attachment)
  - Virtual columns (QrCode, Barcode, Formula, Rollup, Lookup)
- Comprehensive column type examples in `examples/column-types-example.md`
- Enhanced documentation for column types and their parameters

### Fixed
- PhoneNumber column type identifier (was incorrectly "Phone", now "PhoneNumber")
- Boolean default values now use string format ('true'/'false') instead of integers
- Improved error handling for column operations
- SingleSelect/MultiSelect columns now properly handle options in meta field

### Changed
- Enhanced README with detailed column management documentation
- Reorganized field types documentation with categories and special parameters
- Updated tool handler to properly handle QrCode/Barcode column requirements

## [0.1.1] - Previous Release

### Initial Features
- Database operations (list bases, get base info)
- Table management (create, list, delete tables)
- Record CRUD operations
- Advanced queries and filtering
- View management
- File attachments
- Bulk operations