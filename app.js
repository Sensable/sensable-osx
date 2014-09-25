var keyring = require('keyring'),
    smc = require('smc'),
    request = require('request'),
    reporter = require('./lib/reporter');

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

var ids = {
    temperature: sensableUser + '_osx_cpu_temperature',
    fan: sensableUser + '_osx_fan_{FAN_NUMBER}_speed'
};

//Determine computer location by IP
request.get({url: 'http://ipinfo.io/json', json: true}, function(e, r, response) {
    var location = response.loc.split(',').map(function(s){return +s;});
    location = {
        latitude: location[0],
        longitude: location[1]
    };

    console.log('Reporter running in', response.city, 'at', response.loc);
    var numberOfFans = smc.fans(), f;
    console.log('Detected', numberOfFans, 'fans');
    var temperatureReporter = new reporter.Temperature(ids.temperature, location, sensableToken),
        fanReporters = [];
    for (f = 0; f < numberOfFans; f++) {
        fanReporters.push(new reporter.Fan(ids.fan.replace('{FAN_NUMBER}', f), location, f, sensableToken));
    }

    temperatureReporter.report();
    fanReporters.forEach(function(r){
        r.report();
    });
});