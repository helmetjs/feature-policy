var config = require('./config')

module.exports = function makePolicy (options) {
  return Object.keys(options.directives).map(function (featureKey) {
    const dasherizedKey = config.features[featureKey]
    return [dasherizedKey].concat(options.directives[featureKey]).join(' ')
  }).join(';')
}
