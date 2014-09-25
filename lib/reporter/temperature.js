var sensableReporter = require('sensable-reporter'),
    smc = require('smc');

function TemperatureReporter(id, location, token) {
    this.sensableReporter = sensableReporter({
        sensorid: id,
        unit: '°c',
        sensortype: 'temperature',
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'cpu temperature for ' + id
    }, {
        accessToken: token,
        private: false
    });
}

TemperatureReporter.prototype.report = function() {
    var temperature = smc.temperature();

    console.log('Reporting temperature of', temperature, '°c');

    this.sensableReporter.upload(temperature, (+new Date()), function(err) {
        if(err) {
            console.log('Something went wrong', err);
        } else {
            console.log('Temperature reported successfully');
        }
    });
};

module.exports = TemperatureReporter;