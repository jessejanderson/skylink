<!-- markdownlint-disable MD024 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Migrate/refactor everything from `content.js` into a self-contained `background.js`
- Swap `activeTab` permission for `tabs` so that we can drop the `<all_urls>` permission
- Remove permissions for "management" as it is not needed
- Migrate Firefox to Manifest v3 (but this means the minimum FF version is now 109)
- Input validation for domains and DIDs (security enhancement)
- Replace `staging.bsky.app` with `bsky.app`

## [1.3.0]

### Added

- Support for alternative HTTPS method for detecting DID

### Changed

- Remove permissions for "tabs" as it is not needed
- Use www.bsky.app instead of staging.bsky.app for bluesky web app domain

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
