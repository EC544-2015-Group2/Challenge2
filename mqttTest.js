var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', function() {
	client.subscribe('presence');
	client.publish('presence', 'Hello mqtt test for Challenge 2');
});

client.on('message', function (topic, message) {
	// message is Buffer
	console.log(message.toString());
	client.end();
});

// The following is the API for mqtt
// mqtt.connect()
// mqtt.Client()
// mqtt.Client#publish()
// mqtt.Client#subscribe()
// mqtt.Client#end()
// mqtt.Client#handleMessage()
// mqtt.Store()
// mqtt.Store#put()
// mqtt.Store#del()
// mqtt.Store#createStream()
// mqtt.Store#close()
