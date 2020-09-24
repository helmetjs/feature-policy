Feature Policy
==============
[![Build Status](https://travis-ci.org/pedro-gbf/permissions-policy.svg?branch=master)](https://travis-ci.org/pedro-gbf/permissions-policy)

**NOTE: Since the `Feature-Policy` header was deprecated I've decided to adapt the old Evan Hahn `Permissions-Policy` repositoy and adapt it to support it, this project was entirely built on top of his work.**

This is Express middleware to set the `Permissions-Policy` header. You can read more about it [here](https://www.w3.org/TR/permissions-policy-1/).

To use:

```javascript
const permissionsPolicy = require('permissions-policy')

// ...

app.use(permissionsPolicy({
  features: {
    fullscreen: ['self'],
    vibrate: ['none'],
    payment: ['"example.com"'],
    syncXhr: ['none']
  }
}))
```

The following features are currently supported:

* `accelerometer`
* `ambientLightSensor`
* `autoplay`
* `battery`
* `camera`
* `displayCapture`
* `documentDomain`
* `documentWrite`
* `encryptedMedia`
* `executionWhileNotRendered`
* `executionWhileOutOfViewport`
* `fontDisplayLateSwap`
* `fullscreen`
* `geolocation`
* `gyroscope`
* `layoutAnimations`
* `legacyImageFormats`
* `loadingFrameDefaultEager`
* `magnetometer`
* `microphone`
* `midi`
* `navigationOverride`
* `notifications`
* `oversizedImages`
* `payment`
* `pictureInPicture`
* `publickeyCredentials`
* `push`
* `serial`
* `speaker`
* `syncScript`
* `syncXhr`
* `unoptimizedImages`
* `unoptimizedLosslessImages`
* `unoptimizedLossyImages`
* `unsizedMedia`
* `usb`
* `verticalScroll`
* `vibrate`
* `vr`
* `wakeLock`
* `xr`
* `xrSpatialTracking`
