var dotenv = require('dotenv');
dotenv.config(); // set process.env from .env file

var option = process.argv[0]
var modeIsLocal = option === '--local'; // node app.js --local

var awsIot = require('aws-iot-device-sdk');
var rpio = require('rpio');

var deviceName = process.env.DEVICE_NAME;
if (!deviceName) { console.error('A config value DEVICE_NAME is required in .env file.'); exit(1); }

var hostName = process.env.HOST_NAME;
if (!hostName) { console.error('A config value HOST_NAME is required in .env file.'); exit(1); }

var gpioPin = process.env.GPIO_PIN;
if (!hostName && !modeIsLocal) { console.error('A config value GPIO_PIN is required in .env file, when MODE is not LOCAL.'); exit(1); }

var thingShadows = awsIot.thingShadow({
  keyPath: process.env.KEY_PATH || `./certs/${deviceName}.private.key`,
  certPath: process.env.CERT_PATH || `./certs/${deviceName}.cert.pem`,
  caPath: process.env.CA_PATH || './certs/root-CA.crt',
  host: hostName,
  clientId: 'nouser' + (Math.floor((Math.random() * 100000) + 1)), // value from sdk sample default 
  reconnectPeriod: 4000, // value from sdk sample default 
  keepAlive: 3000, // value from sdk sample default 
  protocol: 'mqtts', // value from sdk sample default 
  debug: false,
});

var setPinValue = function(pin, value) {
  if (modeIsLocal) {
    console.log('Pin: ', pin, ', Value: ', value);
  } else {
    rpio.open(pin, rpio.OUTPUT, value);
    rpio.close(pin)
  }
}

thingShadows.on('connect', function () {
  console.log('connected');
  thingShadows.register(deviceName);
});

thingShadows.on('delta', function (thingName, stateObject) {
  var state = stateObject.state;
  console.log('received delta ' + ' on ' + thingName + ': ' + JSON.stringify(stateObject));
  setPinValue(gpioPin, state.lighting ? rpio.HIGH : rpio.LOW);
  thingShadows.update(deviceName, { "state": { "reported": { "lighting": state.lighting } } });
});

thingShadows.on('timeout', function (thingName, clientToken) {
  console.log('received timeout ' + ' on ' + operation + ': ' + clientToken);
});

// mqtt message memo
// $aws/things/RaspberryPiBplus/shadow/update
// state false
/*
{
  "state": {
    "desired": {
      "lighting": false
    }
  }
}
*/
