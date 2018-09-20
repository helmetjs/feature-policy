var config = require('./config')

module.exports = function checkOptions (options) {
  if (!isObject(options)) {
    throw new Error('featurePolicy must be called with an object argument. See the documentation.')
  }

  var directives = options.directives
  console.warn('TODO: change this value to "features"')

  var directivesExist = isObject(directives)
  if (!directivesExist || Object.keys(directives).length === 0) {
    throw new Error('featurePolicy must have at least one directive under the "directives" key. See the documentation.')
  }

  Object.keys(directives).forEach(function (feature) {
    if (!config.features.hasOwnProperty(feature)) {
      throw new Error('featurePolicy does not support the "' + feature + '" feature.')
    }

    var value = directives[feature]

    if (!Array.isArray(value) || value.length === 0) {
      throw new Error('The value of the "' + feature + '" feature must be a non-empty array.')
    }

    var containsStar = false
    var containsNone = false
    value.forEach(function (allowed) {
      if (allowed === '*') {
        containsStar = true
      } else if (allowed === "'none'") {
        containsNone = true
      } else if (allowed === 'self') {
        throw new Error("'self' must be quoted.")
      } else if (allowed === 'none') {
        throw new Error("'none' must be quoted.")
      }
    })

    if (value.length > 1) {
      if (containsStar) {
        throw new Error('The value of the "' + feature + '" feature cannot contain * and other values.')
      } else if (containsNone) {
        throw new Error('The value of the "' + feature + '" feature cannot contain \'none\' and other values.')
      }
    }
  })
}

function isObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}
