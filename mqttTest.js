var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://test.mosquitto.org');
var array1 = [0,1,2,3,4,5,6,7,8,9];
var object = {type: 'test', value: 0, array: array1};
var string = 'Hello mqtt test for Challenge 2';

// stringify the data before publishing it
var publishMessage = JSON.stringify(object);

client.on('connect', function() {
	client.subscribe('EC544Group2_Challenge2');
	client.publish('EC544Group2_Challenge2', publishMessage);
	// console.log(JSON.stringify(array1));
});

client.on('message', function (topic, message) {
	// message is Buffer
	message = message.toString();
	message = JSON.parse(message);
	console.log(message);
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
