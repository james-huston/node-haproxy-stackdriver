
var debug = require('debug');
var serialNumber = require('serial-number');
var serverStats = require('./lib/serverstats');
var systemStats = require('./lib/systemstats');

serialNumber(function (err, value) {
  console.log('Serial Number', value);
});

function sendStats() {
  serverStats(function () {
    debug('serverStats tick completed');
  });

  systemStats(function () {
    debug ('systemStats tick completed');
  });
}

sendStats();
setInterval(sendStats, 60000);
