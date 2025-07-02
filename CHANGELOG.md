# Changelog

All notable changes to this project will be documented in this file.

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