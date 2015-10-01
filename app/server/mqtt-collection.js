var Fiber = Npm.require('fibers');
var mqttUrl = 'mqtt://broker.mqttdashboard.com',
    mqttTopic = 'EC544Group2_Challenge2';


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
