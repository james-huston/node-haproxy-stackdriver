
var haproxystat = require('../node_modules/haproxy-stat/lib/haproxystat');
var config = require('../config');
var request = require('superagent');
var debug = require('debug')('hastack::systemstats');
var serialNumber = require('serial-number');

module.exports = function (callback) {
  var hastat = haproxystat(config);

  var endpoint = 'https://custom-gateway.stackdriver.com/v1/custom';

  serialNumber(function (err, serial) {
    if (err) return callback(err);

    hastat.showStat(function (err, data) {
      if (err) return callback(err);

      var timestamp = Math.round(Date.now() / 1000);
      var sdData = {
        timestamp: timestamp,
        proto_version: 1,
        data: []
      };

      data.forEach(function (system) {
        debug(system);
        sdData.data.push({
          name: 'haproxy:' + system.pxname + ':' + system.svname +
            '::ConnectionRate',
          value: parseInt(system.rate),
          instance: serial,
          collected_at: timestamp
        });

        sdData.data.push({
          name: 'haproxy:' + system.pxname + ':' + system.svname +
            '::CurrentConnections',
          value: parseInt(system.scur),
          instance: serial,
          collected_at: timestamp
        });
      });

      debug(sdData);

      request
        .post(endpoint)
        .set('Accept', 'application/json')
        .set('x-stackdriver-apikey', config.apiKey)
        .send(sdData)
        .end(function (req) {
          if (err) {
            debug('Failed to send stats', req.error, req.text);
            return callback(err);
          }

          debug('stats sent');
          return callback(undefined, data);
        });
    });
  });
};
