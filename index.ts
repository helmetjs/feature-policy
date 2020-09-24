import { IncomingMessage, ServerResponse } from 'http';

interface PermissionsPolicyOptions {
  features: {[featureName: string]: string[]};
}

const reserveredKeywords = new Set([
  'self',
  'src',
  '*',
  'none'
]);

function isPlainObject(value: unknown): value is {[key: string]: unknown} {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null
  );
}

function isQuoted(value: string) {
  return /^".*"$/.test(value);
}

function getHeaderValueFromOptions(options: unknown): string {
  const FEATURES: {[featureKeyCamelCase: string]: string} = {
    accelerometer: 'accelerometer',
    ambientLightSensor: 'ambient-light-sensor',
    autoplay: 'autoplay',
    battery: 'battery',
    camera: 'camera',
    displayCapture: 'display-capture',
    documentDomain: 'document-domain',
    documentWrite: 'document-write',
    encryptedMedia: 'encrypted-media',
    executionWhileNotRendered: 'execution-while-not-rendered',
    executionWhileOutOfViewport: 'execution-while-out-of-viewport',
    fontDisplayLateSwap: 'font-display-late-swap',
    fullscreen: 'fullscreen',
    geolocation: 'geolocation',
    gyroscope: 'gyroscope',
    layoutAnimations: 'layout-animations',
    legacyImageFormats: 'legacy-image-formats',
    loadingFrameDefaultEager: 'loading-frame-default-eager',
    magnetometer: 'magnetometer',
    microphone: 'microphone',
    midi: 'midi',
    navigationOverride: 'navigation-override',
    notifications: 'notifications',
    oversizedImages: 'oversized-images',
    payment: 'payment',
    pictureInPicture: 'picture-in-picture',
    publickeyCredentials: 'publickey-credentials',
    push: 'push',
    serial: 'serial',
    speaker: 'speaker',
    syncScript: 'sync-script',
    syncXhr: 'sync-xhr',
    unoptimizedImages: 'unoptimized-images',
    unoptimizedLosslessImages: 'unoptimized-lossless-images',
    unoptimizedLossyImages: 'unoptimized-lossy-images',
    unsizedMedia: 'unsized-media',
    usb: 'usb',
    verticalScroll: 'vertical-scroll',
    vibrate: 'vibrate',
    vr: 'vr',
    wakeLock: 'wake-lock',
    xr: 'xr',
    xrSpatialTracking: 'xr-spatial-tracking',
  };

  if (!isPlainObject(options)) {
    throw new Error('permissionsPolicy must be called with an object argument. See the documentation.');
  }

  const { features } = options;
  if (!isPlainObject(features)) {
    throw new Error('permissionsPolicy must have a single key, "features", which is an object of features. See the documentation.');
  }

  const result = Object.entries(features).map(([featureKeyCamelCase, featureValue]) => {
    if (!Object.prototype.hasOwnProperty.call(FEATURES, featureKeyCamelCase)) {
      throw new Error(`permissionsPolicy does not support the "${ featureKeyCamelCase }" feature.`);
    }

    if (!Array.isArray(featureValue) || featureValue.length === 0) {
      throw new Error(`The value of the "${featureKeyCamelCase}" feature must be a non-empty array of strings.`);
    }

    const allowedValuesSeen: Set<string> = new Set();

    featureValue.forEach((allowedValue) => {
      if (typeof allowedValue !== 'string') {
        throw new Error(`The value of the "${featureKeyCamelCase}" feature contains a non-string, which is not supported.`);
      } else if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(`The value of the "${featureKeyCamelCase}" feature contains duplicates, which it shouldn't.`);
      } else if (allowedValue === "'self'") {
        throw new Error("self must not be quoted.");
      } else if (allowedValue === "'none'") {
        throw new Error("none must not be quoted.");
      } else if (allowedValue === "'src'") {
        throw new Error("src must not be quoted.");
      } else if (!reserveredKeywords.has(allowedValue) && !isQuoted(allowedValue)) {
        throw new Error("values beside reserved keywords must be quoted.");
      }

      allowedValuesSeen.add(allowedValue);
    });

    if (featureValue.length > 1) {
      if (allowedValuesSeen.has('*')) {
        throw new Error(`The value of the "${featureKeyCamelCase}" feature cannot contain * and other values.`);
      } else if (allowedValuesSeen.has("'none'")) {
        throw new Error(`The value of the "${featureKeyCamelCase}" feature cannot contain 'none' and other values.`);
      }
    }

    const featureKeyDashed = FEATURES[featureKeyCamelCase];
    const featureValuesUnion = featureValue.join(' ');
    return `${featureKeyDashed}=(${featureValuesUnion})`;
  }).join(', ');

  if (result.length === 0) {
    throw new Error('At least one feature is required.');
  }

  return result;
}

export = function permissionsPolicy (options: PermissionsPolicyOptions) {
  const headerValue = getHeaderValueFromOptions(options);

  return function permissionsPolicy (_req: IncomingMessage, res: ServerResponse, next: () => void) {
    res.setHeader('Permissions-Policy', headerValue);
    next();
  };
};
