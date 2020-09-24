import { test } from "node:test";
import assert from "node:assert/strict";
import connect from "connect";
import request from "supertest";
import type { IncomingMessage, ServerResponse } from "http";

import permissionsPolicy from ".";

function dashify(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

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

function app(
  middleware: ReturnType<typeof permissionsPolicy>,
): connect.Server {
  const result = connect();
  result.use(middleware);
  result.use((_req: IncomingMessage, res: ServerResponse) => {
    res.end("Hello world!");
  });
  return result;
}

test("fails without at least 1 feature", () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  assert.throws(() => (permissionsPolicy as any)(), Error);
  assert.throws(() => permissionsPolicy({} as any), Error);
  assert.throws(() => permissionsPolicy({ features: null } as any), Error);
  assert.throws(() => permissionsPolicy({ features: {} } as any), Error);
  /* eslint-enable @typescript-eslint/no-explicit-any */
});

test("fails with features outside the allowlist", () => {
  assert.throws(() => permissionsPolicy({ features: { garbage: ["*"] } }));
});

test("fails if a feature's value is not an array", () => {
  [
    "self",
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
      permissionsPolicy({
        features: { vibrate: value as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
    );
  });
});

test("fails if a feature's value is an array with a non-string", () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  assert.throws(() =>
    permissionsPolicy({
      features: { vibrate: ['"example.com"', null] as any },
    }),
  );
  assert.throws(() =>
    permissionsPolicy({
      features: { vibrate: ['"example.com"', 123] as any },
    }),
  );
  assert.throws(() =>
    permissionsPolicy({
      features: { vibrate: [new String('"example.com"')] as any },
    }),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
});

test("fails if reserved keywords are quoted", () => {
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ["'self'"] },
    });
  });
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ["'none'"] },
    });
  });
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ["'src'"] },
    });
  });
});

test("fails if non-reserved values are not quoted", () => {
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ["example.com"] },
    });
  });
});

test("fails if a feature's value is an empty array", () => {
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: [] },
    });
  });
});

test('fails if a feature value contains "*" and additional values', () => {
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ["*", '"example.com"'] },
    });
  });
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ['"example.com"', "*"] },
    });
  });
});

test("fails if a feature value contains duplicates", () => {
  assert.throws(() => {
    permissionsPolicy({
      features: { vibrate: ['"example.com"', '"example.com"'] },
    });
  });
});

test('can set "vibrate" to "*"', async () => {
  await request(app(permissionsPolicy({ features: { vibrate: ["*"] } })))
    .get("/")
    .expect("Permissions-Policy", "vibrate=(*)")
    .expect("Hello world!");
});

test('can set "vibrate" to "self"', async () => {
  await request(app(permissionsPolicy({ features: { vibrate: ["self"] } })))
    .get("/")
    .expect("Permissions-Policy", "vibrate=(self)")
    .expect("Hello world!");
});

test('can set "vibrate" to "none"', async () => {
  await request(app(permissionsPolicy({ features: { vibrate: ["none"] } })))
    .get("/")
    .expect("Permissions-Policy", "vibrate=(none)")
    .expect("Hello world!");
});

test('can set "vibrate" to contain domains', async () => {
  await request(
    app(
      permissionsPolicy({
        features: { vibrate: ['"example.com"', '"evanhahn.com"'] },
      }),
    ),
  )
    .get("/")
    .expect("Permissions-Policy", 'vibrate=("example.com" "evanhahn.com")')
    .expect("Hello world!");
});

test('can set all values in the allowlist to "*"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["*"] };

      await request(app(permissionsPolicy({ features })))
        .get("/")
        .expect("Permissions-Policy", `${dashify(feature)}=(*)`)
        .expect("Hello world!");
    }),
  );
});

test('can set all values in the allowlist to "self"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["self"] };

      await request(app(permissionsPolicy({ features })))
        .get("/")
        .expect("Permissions-Policy", `${dashify(feature)}=(self)`)
        .expect("Hello world!");
    }),
  );
});

test('can set all values in the allowlist to "none"', async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ["none"] };

      await request(app(permissionsPolicy({ features })))
        .get("/")
        .expect("Permissions-Policy", `${dashify(feature)}=(none)`)
        .expect("Hello world!");
    }),
  );
});

test("can set all values in the allowlist to domains", async () => {
  await Promise.all(
    ALLOWED_FEATURE_NAMES.map(async (feature) => {
      const features = { [feature]: ['"example.com"', '"evanhahn.com"'] };

      await request(app(permissionsPolicy({ features })))
        .get("/")
        .expect(
          "Permissions-Policy",
          `${dashify(feature)}=("example.com" "evanhahn.com")`,
        )
        .expect("Hello world!");
    }),
  );
});

test("can set everything all at once", async () => {
  const features = ALLOWED_FEATURE_NAMES.reduce(
    (result, feature) => ({
      ...result,
      [feature]: [`"${feature}.example.com"`],
    }),
    {},
  );

  const response = await request(app(permissionsPolicy({ features })))
    .get("/")
    .expect("Hello world!");

  const actualFeatures =
    response.get("permissions-policy")?.split(", ") ?? [];
  const actualFeaturesSet = new Set(actualFeatures);

  assert.equal(actualFeatures.length, actualFeaturesSet.size);
  assert.equal(actualFeatures.length, ALLOWED_FEATURE_NAMES.length);

  ALLOWED_FEATURE_NAMES.forEach((feature) => {
    const expectedStr = `${dashify(feature)}=("${feature}.example.com")`;
    assert(actualFeaturesSet.has(expectedStr));
  });
});
