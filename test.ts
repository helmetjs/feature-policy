import { test } from "node:test";
import assert from "node:assert/strict";
import connect from "connect";
import request from "supertest";
import dashify from "dashify";
import { IncomingMessage, ServerResponse } from "http";

import featurePolicy from ".";

const ALLOWED_FEATURE_NAMES = [
  "accelerometer",
  "ambientLightSensor",
  "autoplay",
  "battery",
  "camera",
  "displayCapture",
  "documentDomain",
  "documentWrite",
  "encryptedMedia",
  "executionWhileNotRendered",
  "executionWhileOutOfViewport",
  "fontDisplayLateSwap",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "layoutAnimations",
  "legacyImageFormats",
  "loadingFrameDefaultEager",
  "magnetometer",
  "microphone",
  "midi",
  "navigationOverride",
  "notifications",
  "oversizedImages",
  "payment",
  "pictureInPicture",
  "publickeyCredentials",
  "push",
  "serial",
  "speaker",
  "syncScript",
  "syncXhr",
  "unoptimizedImages",
  "unoptimizedLosslessImages",
  "unoptimizedLossyImages",
  "unsizedMedia",
  "usb",
  "verticalScroll",
  "vibrate",
  "vr",
  "wakeLock",
  "xr",
  "xrSpatialTracking",
];

function app(middleware: ReturnType<typeof featurePolicy>): connect.Server {
  const result = connect();
  result.use(middleware);
  result.use((_req: IncomingMessage, res: ServerResponse) => {
    res.end("Hello world!");
  });
  return result;
}

test("fails without at least 1 feature", () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  assert.throws(() => (featurePolicy as any)(), Error);
  assert.throws(() => featurePolicy({} as any), Error);
  assert.throws(() => featurePolicy({ features: null } as any), Error);
  assert.throws(() => featurePolicy({ features: {} } as any), Error);
  /* eslint-enable @typescript-eslint/no-explicit-any */
});

test("fails with features outside the allowlist", () => {
  assert.throws(() => featurePolicy({ features: { garbage: ["*"] } }));
});

test("fails if a feature's value is not an array", () => {
  [
    "'self'",
    null,
    undefined,
    123,
    true,
    false,
    {
      length: 1,
      "0": "*",
    },
  ].forEach((value) => {
    assert.throws(() =>
      featurePolicy({
        features: { vibrate: value as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
    );
  });
});

test("fails if a feature's value is an array with a non-string", () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  assert.throws(() =>
    featurePolicy({
      features: { vibrate: ["example.com", null] as any },
    }),
  );
  assert.throws(() =>
    featurePolicy({
      features: { vibrate: ["example.com", 123] as any },
    }),
  );
  assert.throws(() =>
    featurePolicy({
      features: { vibrate: [new String("example.com")] as any },
    }),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
});

test('fails if "self" or "none" are not quoted', () => {
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["self"] },
    });
  });
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["none"] },
    });
  });
});

test("fails if a feature's value is an empty array", () => {
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: [] },
    });
  });
});

test('fails if a feature value contains "*" and additional values', () => {
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["*", "example.com"] },
    });
  });
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["example.com", "*"] },
    });
  });
});

test('fails if a feature value contains "none" and additional values', () => {
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["'none'", "example.com"] },
    });
  });
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["example.com", "'none'"] },
    });
  });
});

test("fails if a feature value contains duplicates", () => {
  assert.throws(() => {
    featurePolicy({
      features: { vibrate: ["example.com", "example.com"] },
    });
  });
});

test('can set "vibrate" to "*"', async () => {
  await request(app(featurePolicy({ features: { vibrate: ["*"] } })))
    .get("/")
    .expect("Feature-Policy", "vibrate *")
    .expect("Hello world!");
});

test('can set "vibrate" to "self"', async () => {
  await request(app(featurePolicy({ features: { vibrate: ["'self'"] } })))
    .get("/")
    .expect("Feature-Policy", "vibrate 'self'")
    .expect("Hello world!");
});

test('can set "vibrate" to "none"', async () => {
  await request(app(featurePolicy({ features: { vibrate: ["'none'"] } })))
    .get("/")
    .expect("Feature-Policy", "vibrate 'none'")
    .expect("Hello world!");
});

test('can set "vibrate" to contain domains', async () => {
  await request(
    app(
      featurePolicy({ features: { vibrate: ["example.com", "evanhahn.com"] } }),
    ),
  )
    .get("/")
    .expect("Feature-Policy", "vibrate example.com evanhahn.com")
    .expect("Hello world!");
});

test('can set all values in the allowlist to "*"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["*"] };

      await request(app(featurePolicy({ features })))
        .get("/")
        .expect("Feature-Policy", `${dashify(feature)} *`)
        .expect("Hello world!");
    }),
  );
});

test('can set all values in the allowlist to "self"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["'self'"] };

      await request(app(featurePolicy({ features })))
        .get("/")
        .expect("Feature-Policy", `${dashify(feature)} 'self'`)
        .expect("Hello world!");
    }),
  );
});

test('can set all values in the allowlist to "none"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["'none'"] };

      await request(app(featurePolicy({ features })))
        .get("/")
        .expect("Feature-Policy", `${dashify(feature)} 'none'`)
        .expect("Hello world!");
    }),
  );
});

test("can set all values in the allowlist to domains", async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["example.com", "evanhahn.com"] };

      await request(app(featurePolicy({ features })))
        .get("/")
        .expect(
          "Feature-Policy",
          `${dashify(feature)} example.com evanhahn.com`,
        )
        .expect("Hello world!");
    }),
  );
});

test("can set everything all at once", async () => {
  const features = ALLOWED_FEATURE_NAMES.reduce(
    (result, feature) => ({
      ...result,
      [feature]: [`${feature}.example.com`],
    }),
    {},
  );

  const response = await request(app(featurePolicy({ features })))
    .get("/")
    .expect("Hello world!");

  const actualFeatures = response.get("feature-policy")?.split(";") ?? [];
  const actualFeaturesSet = new Set(actualFeatures);

  assert.equal(actualFeatures.length, actualFeaturesSet.size);
  assert.equal(actualFeatures.length, ALLOWED_FEATURE_NAMES.length);

  ALLOWED_FEATURE_NAMES.forEach((feature) => {
    const expectedStr = `${dashify(feature)} ${feature}.example.com`;
    assert(actualFeaturesSet.has(expectedStr));
  });
});

test("names its function and middleware", () => {
  assert.equal(featurePolicy.name, "featurePolicy");
  assert.equal(
    featurePolicy.name,
    featurePolicy({
      features: { vibrate: ["*"] },
    }).name,
  );
});
