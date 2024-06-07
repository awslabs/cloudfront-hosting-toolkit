# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-09-31
### Added
- Initial version

## [1.1.0] - 2024-01-10
### Added

- Use CloudFront KeyValueStore to store commitId

### Changed
### Fixed

## [1.1.1] - 2024-01-10
### Added

### Changed

- remove age and date header

### Fixed

## [1.1.2] - 2024-01-10
### Added

### Changed

- build AWS Layer manually

### Fixed

## [1.1.3] - 2024-01-25
### Added

- max name for OAC & remove old comments

### Changed
### Fixed

## [1.1.4] - 2024-01-25
### Added

### Changed

- use custom name for KVS

### Fixed

## [1.1.5] - 2024-01-25
### Added

- Use Lambda Power Tools for logging and tracing

### Changed
### Fixed


## [1.1.6] - 2024-05-24
### Added


### Changed

- Use one CloudFront Function template per framework
- Generate the necessary dummy zip file required by the Pipeline during installation, instead of using the CLI deploy command

### Fixed

## [1.1.7] - 2024-06-04
### Added


### Changed


### Fixed

- Address the behavior when a user wants to utilize their own framework that is not included in the existing list of supported frameworks

## [1.1.8] - 2024-06-05
### Added


### Changed


### Fixed

- Lambda layer path
- Update Readme CDK Usage

## [1.1.9] - 2024-06-05
### Added


### Changed


### Fixed

- Fix A record


## [1.1.10] - 2024-06-07
### Added

- Add option to submit a feature request


### Changed


### Fixed


## [1.1.11] - 2024-06-07
### Added


### Changed


### Fixed

- fix wording for A record
- update a few prompts to be more explicit
