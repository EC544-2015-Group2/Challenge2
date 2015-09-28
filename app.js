var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var MongoClient = require('mongodb').MongoClient,
    mqtt = require('mqtt');

var mongoURL = 'mongodb://localhost:27017/ZigBeeBaseStation',
    mongoCollectionName = 'temperatures',
    mqttURL = 'mqtt://broker.mqttdashboard.com',
    mqttTopic = 'EC544-Group2-Challenge1/temperature/';


// Static routing
app.use('/', express.static(__dirname + '/client'));


MongoClient.connect(mongoURL, function(err, db) {
    if (err) console.log('Error connecting to MongoDB database: ' + err);
    else {
        var collection = db.collection(mongoCollectionName);

        var mqttClient = mqtt.connect(mqttURL);
        mqttClient.on('connect', function() {
            console.log('MQTT connected.');
            mqttClient.subscribe(mqttTopic);
            mqttClient.on('message', function(topic, message) {
				console.log('got MQTT message');
                var doc = JSON.parse(message.toString('ascii'));
                collection.insertOne(doc, errLogger);
                var values = doc.temperatures.map(getValues);
                var row = [doc.time, [average(values), standardDeviation(values)]];
                io.emit('data', JSON.stringify(row));
            });
        });
        mqttClient.on('offline', function() {
            console.log('MQTT connection lost.');
        });

        io.on('connection', function(socket) {
            console.log('A user connected');
            socket.on('query', function(query) {
                collection.find(JSON.parse(query)).toArray(function(err, docs) {
                    if (err) console.log(err);
                    else {
                        var data = docs.map(function(doc) {
                            var values = doc.temperatures.map(getValues);
                            return [doc.time, [average(values), standardDeviation(values)]];
                        });
                        socket.emit('data', JSON.stringify(data));
                    }
                });
            });
        });

        server.listen(3000, function() {
            console.log('Listening on *:3000')
        });
    }
});

// Helper functions

function errLogger(err, result){
	if(err) console.log(err);
}

function getValues(item) {
    return item.value;
}

function average(arr) {
    return (1 / arr.length) * arr.reduce(function(sum, val) {
        return sum + val;
    });
}

function standardDeviation(arr) {
    var avg = average(arr);
    return Math.pow(average(arr.map(function(val) {
        return Math.pow((val - avg), 2);
    })), 0.5);
}
