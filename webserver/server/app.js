var Fiber = Npm.require('fibers');
var mqttUrl = 'mqtt://broker.mqtt-dashboard.com',
    mqttTopic = 'EC544Group2_Challenge2';

// Temperatures.mqttConnect(mqttUrl, [mqttTopic], {insert: true});
var mqttClient = mqtt.connect(mqttUrl);
mqttClient.on('connect', function() {
    mqttClient.subscribe(mqttTopic);
})

mqttClient.on('message', function(topic, message) {
    Fiber(function() {
        Temperatures.insert(JSON.parse(message.toString()));
    }).run()
});


// Meteor.publish('temperatures', function(){
// 	return Temperatures.find();
// });