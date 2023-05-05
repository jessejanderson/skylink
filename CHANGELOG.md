<!-- markdownlint-disable MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2023-05-03

### Added

- Support for Firefox
- Privacy consent dialog for Google DNS (required by Mozilla)
- Eslint and prettier config

## [1.1.0] - 2023-05-03

### Changed

- Use DID for profile url instead of domain name

## [1.0.1] - 2023-04-30

### Fixed

- Remove www when checking for TXT record

## [1.0.0] - 2023-04-30

### Added

- Check for DID in current domain's TXT records
- Light up icon blue if DID detected
- Clicking icon opens tab to profile
