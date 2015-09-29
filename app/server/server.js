var Fiber = Npm.require('fibers');
var mqttUrl = 'mqtt://broker.mqttdashboard.com',
    mqttTopic = 'EC544Group2_Challenge2';


Meteor.startup(function() {
    Meteor.publish('temperatures', function() {
        return Temperatures.find();
    });
    if (Temperatures.find().count() === 0) {
        var endDate = Date.now(),
            startDate = endDate - (30 * 24 * 60 * 60 * 1000);

        for (var i = startDate; i < endDate; i += (5 * 60 * 1000)) {
            var date = new Date(i);
            var currentTemp = 15 - (1 + 2 * Math.random()) * Math.cos(2 * Math.PI / 24 * (date.getHours() + date.getMinutes() / 60)) - 10 * Math.cos(2 * Math.PI / 12 * (date.getMonth() + date.getDate() / 31));
            var temps = [];
            for (var deviceNum = 0; deviceNum < 4; deviceNum++)
                temps.push({
                    deviceID: '0013a2000000000' + deviceNum,
                    value: (currentTemp + 2 * (Math.random() - 0.5))
                });
            Temperatures.insert({
                time: i,
                temperatures: temps
            });
        }
    }
});


var mqttClient = mqtt.connect(mqttUrl);
mqttClient.on('connect', function() {
    console.log('MQTT connected');
    mqttClient.subscribe(mqttTopic);
});

mqttClient.on('message', function(topic, message) {
    Fiber(function() {
        console.log('Message received')
        Temperatures.insert(JSON.parse(message.toString()));
    }).run()
});
