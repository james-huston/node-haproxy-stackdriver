
var haproxystat = require('../node_modules/haproxy-stat/lib/haproxystat');
var config = require('../config');
var request = require('superagent');
var debug = require('debug')('hastack::serverstats');
var serialNumber = require('serial-number');

module.exports = function (callback) {
  var hastat = haproxystat(config);

  var endpoint = 'https://custom-gateway.stackdriver.com/v1/custom';

  serialNumber(function (err, serial) {
    if (err) return callback(err);

    hastat.showInfo(function (err, data) {
      if (err) return callback(err);

      debug(data);

      var timestamp = Math.round(Date.now() / 1000);

      var sdData = {
        timestamp: timestamp,
        proto_version: 1,
        data: [
          {
            name: 'haproxy:' + data.name + ':ConnectionRate',
            value: parseInt(data.ConnRate),
            instance: serial,
            collected_at: timestamp
          },
          {
            name: 'haproxy:' + data.name + ':CurrentConnections',
            value: parseInt(data.current_conns),
            instance: serial,
            collected_at: timestamp
          }
        ]
      };

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
