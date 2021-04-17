# Changelog

## Unreleased

### Added

- ESM support

### Changed

- Removed restrictions on which directives can be set; any key is allowed

### Removed

- **Breaking:** Dropped support for old Node versions. Node 18+ is now required
- **Breaking:** The returned middleware no longer has a `name` property. This is unlikely to be an issue for most people

## 0.6.0 - 2020-12-22

### Changed

- Updated readme about header deprecation
- TypeScript: marked argument as `Readonly`

## 0.5.0 - 2020-04-16

### Added

- 7 new features: `battery`, `displayCapture`, `executionWhileNotRendered`, `executionWhileOutOfViewport`, `navigationOverride`, `publickeyCredentials`, and `xrSpatialTracking`

## 0.4.0 - 2019-09-01

### Changed

- Duplicate values are no longer allowed
- Non-strings are not allowed in the array

### Removed

- **Breaking:** Drop support for Node <8

## 0.3.0 - 2019-05-05

### Added

- 19 new features: `ambientLightSensor`, `documentDomain`, `documentWrite`, `encryptedMedia`, `fontDisplayLateSwap`, `layoutAnimations`, `legacyImageFormats`, `loadingFrameDefaultEager`, `oversizedImages`, `pictureInPicture`, `serial`, `syncScript`, `unoptimizedImages`, `unoptimizedLosslessImages`, `unoptimizedLossyImages`, `unsizedMedia`, `verticalScroll`, `wakeLock`, and `xr`
- TypeScript definitions
- Created a changelog

### Changed

- Updated some package metadata

## 0.1.0 - 2020-09-25

### Added

- Initial release containing all the adaptations of the [Feature Policy](https://github.com/helmetjs/feature-policy) project to support the new `Permissions-Policy` header.

### Changed

- If you're migrating from feature-policy, note that reserved keywords don't need to be quoted but specific feature values must be.
- Added errors to safeguard the usage with the newest changes.
- Reviewed all the tests.
