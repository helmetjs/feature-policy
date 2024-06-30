# Changelog

## Unreleased

### Added

- ESM support

### Removed

- **Breaking:** Dropped support for old Node versions. Node 18+ is now required

## 0.6.0 - 2020-12-22

### Changed

- Updated readme about header deprecation
- TypeScript: marked argument as `Readonly`

## 0.5.0 - 2020-04-16

### Added

- 7 new features: `battery`, `displayCapture`, `executionWhileNotRendered`, `executionWhileOutOfViewport`, `navigationOverride`, `publickeyCredentials`, and `xrSpatialTracking`

## 0.4.0 - 2019-09-01

### Changed

- Duplicate values are no longer allowed. See [#4](https://github.com/helmetjs/feature-policy/issues/4)
- Non-strings are not allowed in the array

### Removed

- **Breaking:** Drop support for Node <8

## 0.3.0 - 2019-05-05

### Added

- 19 new features: `ambientLightSensor`, `documentDomain`, `documentWrite`, `encryptedMedia`, `fontDisplayLateSwap`, `layoutAnimations`, `legacyImageFormats`, `loadingFrameDefaultEager`, `oversizedImages`, `pictureInPicture`, `serial`, `syncScript`, `unoptimizedImages`, `unoptimizedLosslessImages`, `unoptimizedLossyImages`, `unsizedMedia`, `verticalScroll`, `wakeLock`, and `xr`
- TypeScript definitions. See [#2](https://github.com/helmetjs/feature-policy/issues/2) and [helmet#188](https://github.com/helmetjs/helmet/issues/188)
- Created a changelog

### Changed

- Updated some package metadata

Changes in versions 0.2.0 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
