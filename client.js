var dotenv = require('dotenv');
dotenv.config(); // set process.env from .env file

var awsIot = require('aws-iot-device-sdk');
const readlineSync = require('readline-sync');

var deviceName = process.env.DEVICE_NAME;
if (!deviceName) { console.error('A config value DEVICE_NAME is required in .env file.'); exit(1); }

var hostName = process.env.HOST_NAME;
if (!hostName) { console.error('A config value HOST_NAME is required in .env file.'); exit(1); }

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

var value;
var state = readlineSync.question('Set Patolamp lighting desired true/false/t/f: ');
if (state === 'true' || state === 'false' || state === 't' || state === 'f') {
  value = state === 'true' || state === 't';
  console.log('Set Patolamp lighting desired: ', value);
} else {
  console.log('Please type true/false/t/f');
  process.exit(1);
}

var updateClientToken;
thingShadows.on('connect', function () {
  console.log('connected');
  thingShadows.register(deviceName);
  setTimeout( function() {
    updateClientToken = thingShadows.update(deviceName, { "state": { "desired": { "lighting": value } } });
  }, 2000);
});

thingShadows.on('status', function(thingName, stat, clientToken, stateObject) {
  if(updateClientToken === clientToken) {
    console.log('update success');
    process.exit(0);
  }
});
