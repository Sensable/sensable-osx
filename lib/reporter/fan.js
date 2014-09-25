var sensableReporter = require('sensable-reporter'),
    smc = require('smc');

function FanReporter(id, location, fanId, token) {
    this.sensableReporter = sensableReporter({
        sensorid: id,
        unit: 'RPM',
        sensortype: 'rpm',
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'fan speed for ' + id
    }, {
        accessToken: token,
        private: false
    });
    this.fanId = fanId;
}

FanReporter.prototype.report = function() {
    var fanId = this.fanId,
        rpm = smc.fanRpm(fanId);

    console.log('Reporting fan speed of', rpm, 'RPM for fan ' + this.fanId);

    this.sensableReporter.upload(rpm, (+new Date()), function(err) {
        if(err) {
            console.log('Something went wrong', err);
        } else {
            console.log('Fan speed for fan', fanId, 'reported successfully');
        }
    });
};

module.exports = FanReporter;