var featurePolicy = require('..')

var connect = require('connect')
var supertest = require('supertest')
var assert = require('assert')
var dasherize = require('dasherize')

var WHITELISTED = [
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
  'payment'
]

function app () {
  var result = connect()
  result.use(featurePolicy.apply(null, arguments))
  result.use(function (req, res) {
    res.end('Hello world!')
  })
  return result
}

describe('featurePolicy', function () {
  it('fails without at least 1 directive', function () {
    assert.throws(() => featurePolicy(), Error)
    assert.throws(() => featurePolicy({}), Error)
    assert.throws(() => featurePolicy({ directives: null }), Error)
    assert.throws(() => featurePolicy({ directives: {} }), Error)
  })

  it('fails with directives outside the whitelist', function () {
    assert.throws(() => featurePolicy({
      directives: { garbage: true }
    }), Error)
  })

  it("fails if a directive's value is not an array", function () {
    [
      "'self'",
      null,
      undefined,
      123,
      true,
      false,
      {
        length: 1,
        '0': '*'
      }
    ].forEach(function (value) {
      assert.throws(() => featurePolicy({
        directives: { vibrate: value }
      }), Error)
    })
  })

  it('fails if "self" or "none" are not quoted', function () {
    assert.throws(() => featurePolicy({
      directives: { vibrate: ['self'] }
    }), Error)
    assert.throws(() => featurePolicy({
      directives: { vibrate: ['none'] }
    }), Error)
  })

  it('fails if a directive value is an empty array', function () {
    assert.throws(() => featurePolicy({
      directives: { vibrate: [] }
    }), Error)
  })

  it('fails if a feature value contains "*" and additional values', function () {
    assert.throws(() => featurePolicy({
      directives: { vibrate: ['*', 'example.com'] }
    }), Error)
    assert.throws(() => featurePolicy({
      directives: { vibrate: ['example.com', '*'] }
    }), Error)
  })

  it('fails if a feature value contains "none" and additional values', function () {
    assert.throws(() => featurePolicy({
      directives: { vibrate: ["'none'", 'example.com'] }
    }), Error)
    assert.throws(() => featurePolicy({
      directives: { vibrate: ['example.com', "'none'"] }
    }), Error)
  })

  it('can set "vibrate" to "*"', function () {
    return supertest(app({
      directives: { vibrate: ['*'] }
    }))
      .get('/')
      .expect('Feature-Policy', 'vibrate *')
      .expect('Hello world!')
  })

  it('can set "vibrate" to "self"', function () {
    return supertest(app({
      directives: { vibrate: ["'self'"] }
    }))
      .get('/')
      .expect('Feature-Policy', "vibrate 'self'")
      .expect('Hello world!')
  })

  it('can set "vibrate" to "none"', function () {
    return supertest(app({
      directives: { vibrate: ["'none'"] }
    }))
      .get('/')
      .expect('Feature-Policy', "vibrate 'none'")
      .expect('Hello world!')
  })

  it('can set "vibrate" to contain domains', function () {
    return supertest(app({
      directives: { vibrate: ['example.com', 'evanhahn.com'] }
    }))
      .get('/')
      .expect('Feature-Policy', 'vibrate example.com evanhahn.com')
      .expect('Hello world!')
  })

  it('can set all values in the whitelist to "*"', function () {
    var tasks = WHITELISTED.map(function (feature) {
      return function () {
        const directives = {}
        directives[feature] = '*'

        return supertest(app({ directives: directives }))
          .get('/')
          .expect('Feature-Policy', dasherize(feature) + ' *')
          .expect('Hello world!')
      }
    })

    return Promise.all(tasks)
  })

  it('can set all values in the whitelist to "self"')

  it('can set all values in the whitelist to "none"')

  it('can set all values in the whitelist to domains')

  it('can set everything all at once')

  it('names its function and middleware', function () {
    assert.strictEqual(featurePolicy.name, 'featurePolicy')
    assert.strictEqual(featurePolicy.name, featurePolicy({
      directives: { vibrate: ['*'] }
    }).name)
  })
})
