var keyring = require('keyring'),
    smc = require('smc'),
    sensableReporter = require('sensable-reporter'),
    request = require('request');

var keyringApi = keyring.instance().load(),
    sensableToken = keyringApi.retrieve('sensable.osx.token'),
    sensableUser = keyringApi.retrieve('sensable.osx.user');

var errorMsg, errorDescription;

if(!sensableToken) {
    errorMsg = 'Missing sensable token.\n';
    errorDescription = '';
    errorDescription += 'Register on sensable.io and get your token\n';
    errorDescription += 'then store it in your local keyring with\n';
    errorDescription += 'keyring store -k sensable.osx.token -v YOUR_TOKEN';
    console.error(errorMsg + errorDescription);
    throw new Error(errorMsg);
}

if(!sensableUser) {
    errorMsg = 'Missing sensable user.\n';
    errorDescription = '';
    errorDescription += 'Register on sensable.io and register your username\n';
    errorDescription += 'then store it in your local keyring with\n';
    errorDescription += 'keyring store -k sensable.osx.user -v YOUR_USERNAME';
    console.error(errorMsg + errorDescription);
    throw new Error(errorMsg);
}

//Determine computer location by IP
request.get({url: 'http://ipinfo.io/json', json: true}, function(e, r, response) {
    var location = response.loc.split(',').map(function(s){return +s;});

    console.log('Reporter running in', response.city, 'at', response.loc);

    var temperatureReporter = sensableReporter({
        sensorid: sensableUser + '.osx.cputemperature',
        unit: '°c',
        sensortype: 'temperature',
        latitude: location[0],
        longitude: location[1],
        name: 'cpu temperature for ' + sensableUser
    }, {
        accessToken: sensableToken,
        private: false
    });

    var temperature = smc.temperature();

    console.log('Reporting temperature of', temperature, '°c');

    temperatureReporter.upload(temperature, (+new Date()), function(err) {
        if(err) {
            console.log('Something went wrong', err);
        } else {
            console.log('Temperature reported successfully');
        }
    });
});