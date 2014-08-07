
var envcfg = require('envcfg');

module.exports = envcfg({
  '*': {
    socketPath: process.env.SOCKET || '/tmp/haproxy.sock',
    apiKey: require('./apikey.js')
  }
});