import connect from 'connect';
import request from 'supertest';
import dashify from 'dashify';
import { IncomingMessage, ServerResponse } from 'http';

import featurePolicy = require('..')

const WHITELISTED = [
  'geolocation',
  'midi',
  'notifications',
  'push',
  'syncXhr',
  'microphone',
  'camera',
  'magnetometer',
  'gyroscope',
  'speaker',
  'vibrate',
  'fullscreen',
  'payment',
  'accelerometer',
  'usb',
  'vr',
  'autoplay',
];

function app (middleware: ReturnType<typeof featurePolicy>): connect.Server {
  const result = connect();
  result.use(middleware);
  result.use((_req: IncomingMessage, res: ServerResponse) => {
    res.end('Hello world!');
  });
  return result;
}

describe('featurePolicy', () => {
  it('fails without at least 1 feature', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    expect(featurePolicy.bind(null)).toThrow();
    expect(featurePolicy.bind(null, {} as any)).toThrow();
    expect(featurePolicy.bind(null, { features: null } as any)).toThrow();
    expect(featurePolicy.bind(null, { features: {} } as any)).toThrow();
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  it('fails with features outside the whitelist', () => {
    expect(featurePolicy.bind(null, {
      features: { garbage: ['*'] },
    })).toThrow();
  });

  it("fails if a feature's value is not an array", () => {
    [
      "'self'",
      null,
      undefined,
      123,
      true,
      false,
      {
        length: 1,
        '0': '*',
      },
    ].forEach((value) => {
      expect(featurePolicy.bind(null, {
        features: { vibrate: value as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
      })).toThrow();
    });
  });

  it('fails if "self" or "none" are not quoted', () => {
    expect(featurePolicy.bind(null, {
      features: { vibrate: ['self'] },
    })).toThrow();
    expect(featurePolicy.bind(null, {
      features: { vibrate: ['none'] },
    })).toThrow();
  });

  it("fails if a feature's value is an empty array", () => {
    expect(featurePolicy.bind(null, {
      features: { vibrate: [] },
    })).toThrow();
  });

  it('fails if a feature value contains "*" and additional values', () => {
    expect(featurePolicy.bind(null, {
      features: { vibrate: ['*', 'example.com'] },
    })).toThrow();
    expect(featurePolicy.bind(null, {
      features: { vibrate: ['example.com', '*'] },
    })).toThrow();
  });

  it('fails if a feature value contains "none" and additional values', () => {
    expect(featurePolicy.bind(null, {
      features: { vibrate: ["'none'", 'example.com'] },
    })).toThrow();
    expect(featurePolicy.bind(null, {
      features: { vibrate: ['example.com', "'none'"] },
    })).toThrow();
  });

  it('can set "vibrate" to "*"', () => {
    return request(app(featurePolicy({
      features: { vibrate: ['*'] },
    })))
      .get('/')
      .expect('Feature-Policy', 'vibrate *')
      .expect('Hello world!');
  });

  it('can set "vibrate" to "self"', () => {
    return request(app(featurePolicy({
      features: { vibrate: ["'self'"] },
    })))
      .get('/')
      .expect('Feature-Policy', "vibrate 'self'")
      .expect('Hello world!');
  });

  it('can set "vibrate" to "none"', () => {
    return request(app(featurePolicy({
      features: { vibrate: ["'none'"] },
    })))
      .get('/')
      .expect('Feature-Policy', "vibrate 'none'")
      .expect('Hello world!');
  });

  it('can set "vibrate" to contain domains', () => {
    return request(app(featurePolicy({
      features: { vibrate: ['example.com', 'evanhahn.com'] },
    })))
      .get('/')
      .expect('Feature-Policy', 'vibrate example.com evanhahn.com')
      .expect('Hello world!');
  });

  it('can set all values in the whitelist to "*"', () => {
    return Promise.all(WHITELISTED.map(feature => {
      const features = { [feature]: ['*'] };

      return request(app(featurePolicy({ features })))
        .get('/')
        .expect('Feature-Policy', `${dashify(feature) } *`)
        .expect('Hello world!');
    }));
  });

  it('can set all values in the whitelist to "self"', () => {
    return Promise.all(WHITELISTED.map(feature => {
      const features = { [feature]: ["'self'"] };

      return request(app(featurePolicy({ features })))
        .get('/')
        .expect('Feature-Policy', `${dashify(feature) } 'self'`)
        .expect('Hello world!');
    }));
  });

  it('can set all values in the whitelist to "none"', () => {
    return Promise.all(WHITELISTED.map(feature => {
      const features = { [feature]: ["'none'"] };

      return request(app(featurePolicy({ features })))
        .get('/')
        .expect('Feature-Policy', `${dashify(feature) } 'none'`)
        .expect('Hello world!');
    }));
  });

  it('can set all values in the whitelist to domains', () => {
    return Promise.all(WHITELISTED.map(feature => {
      const features = { [feature]: ['example.com', 'evanhahn.com'] };

      return request(app(featurePolicy({ features })))
        .get('/')
        .expect('Feature-Policy', `${dashify(feature)} example.com evanhahn.com`)
        .expect('Hello world!');
    }));
  });

  it('can set everything all at once', async () => {
    const features = WHITELISTED.reduce((result, feature) => ({
      ...result,
      [feature]: [`${feature}.example.com`],
    }), {});

    const response = await request(app(featurePolicy({ features })))
      .get('/')
      .expect('Hello world!');

    const actualFeatures = response.get('feature-policy').split(';');
    const actualFeaturesSet = new Set(actualFeatures);

    expect(actualFeatures).toHaveLength(actualFeaturesSet.size);
    expect(actualFeatures).toHaveLength(WHITELISTED.length);

    WHITELISTED.forEach((feature) => {
      const expectedStr = `${dashify(feature)} ${feature}.example.com`;
      expect(actualFeaturesSet.has(expectedStr)).toBeTruthy();
    });
  });

  it('names its function and middleware', () => {
    expect(featurePolicy.name).toBe('featurePolicy');
    expect(featurePolicy.name).toBe(featurePolicy({
      features: { vibrate: ['*'] },
    }).name);
  });
});
