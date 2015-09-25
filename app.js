var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var MongoClient = require('mongodb').MongoClient,
    mqtt = require('mqtt');

var mongoURL = 'mongodb://localhost:27017/ZigBeeBaseStation',
    mongoCollection = 'temperatures',
    mqttURL = 'mqtt://broker.mqtt-dashboard.com',
    mqttTopic = 'EC544-Group2-Challenge1/temperature/';


// Static routing
app.use(express.static('/', __dirname + '/client'));


MongoClient.connect(mongoURL, function(err, db) {
    if (err) console.log('Error connecting to MongoDB database: ' + err);
    else {
        var deviceList = db.collection(mongoCollection).distinct(temperatures.deviceID);
        var mqttClient = mqtt.connect(mqttURL);
        mqttClient.on('connect', function() {
            console.log('MQTT connected.');
            mqttClient.subscribe(mqttTopic);
            mqttClient.on('message', function(topic, message) {
                var data = JSON.parse(message.toString('ascii'));
                db.collection(mongoCollection).insertOne(data, function(err, result) {
                    if (err) console.log('Error inserting in MongoDB collection: ' + err);
                });
                var incomingDeviceList = getDeviceList(data);
                if (deviceList.length !== incomingDeviceList.length)
                    incomingDeviceList.forEach(function(deviceID) {
                        if (deviceList.indexOf(deviceID) < 0) {
                            deviceList.push(deviceID);
                            io.emit('newColumn', JSON.stringify({
                                type: 'number',
                                label: String(deviceID)
                            }));
                        }
                    });
                var row = [data.time];
                deviceList.forEach(function(deviceID) {
                    var index = incomingDeviceList.indexOf(deviceID);
                    row.push(index > 0 ? data.temperatures[index].value : null);
                });
                io.emit('newRow', JSON.stringify(row));
            });
        });
        mqttClient.on('offline', fuction() {
            console.log('MQTT connection lost.');
        });

        io.on('connection', function(socket) {
            console.log('A user connected');
            socket.on('query', function(query) {
                socket.emit('response', JSON.stringify(createDataTable(deviceList, db.collection(mongoCollection).find(JSON.parse(query)))));
            });
        });
    }
});

function getDeviceList(data) {
    return data.temperatures.map(function(item) {
        return item.deviceID;
    });
}

function createDataTable(deviceList, dbCursor) {
    var retObj = {
        cols: [{
            label: 'Time',
            type: 'datetime'
        }],
        rows: []
    }
    deviceList.forEach(function(deviceID) {
        retObj.cols.push({
            type: 'number',
            label: deviceID
        });
    });
    dbCursor.forEach(function(data) {
        var row = {
            c: [{
                v: data.time
            }]
        };
        deviceList.forEach(function(deviceID) {
            var index = getDeviceList(data).indexOf(deviceID);
            row.c.push({
                v: (index > 0 ? data.temperatures[index].value : null);
            });
        });
        retObj.rows.push(row);
    });
    return retObj;
}
