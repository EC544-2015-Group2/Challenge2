var mqtt = require('mqtt');
var mqttURL = 'mqtt://broker.mqttdashboard.com',
    mqttTopic = 'EC544Group2_Challenge2';

var numDevices = 4;
var deviceList = [];
for (var i = 0; i < numDevices; i++)
    deviceList.push('0013a2000000000' + i);

var mqttClient = mqtt.connect(mqttURL);

mqttClient.on('connect', function() {
    console.log('MQTT connected.');
    setInterval(function() {
        var temps = [];
        var date = new Date();
        for (var j = 0; j < numDevices; j++) {
            var val = 15 - (1 + 2 * Math.random()) * Math.cos(2 * Math.PI / 24 * (date.getHours() + date.getMinutes() / 60)) - 10 * Math.cos(2 * Math.PI / 12 * (date.getMonth() + date.getDate() / 31)) + (Math.random() - 0.5);
            temps.push({
                deviceID: deviceList[j],
                value: val
            });
        };
        mqttClient.publish(mqttTopic, JSON.stringify({
            time: Date.now(),
            temperatures: temps
        }));
    }, 1000);
});
