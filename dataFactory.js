var MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://localhost:27017/ZigBeeBaseStation',
    mongoCollection = 'temperatures';

MongoClient.connect(mongoURL, function(err, db) {
    if (err) console.log('Error connecting to MongoDB database: ' + err);
    else
        db.collection(mongoCollection).insert(dataFactory(Date.now() - 2629740000, Date.now()), function(err, res) {
            if (err) console.log(err);
            else console.log('Inserted ' + res.result.n + ' objects into database');
        });
});


function dataFactory(startDate, endDate) {
    data = [];
    deviceList = [];
    for (var i = 0; i < 4; i++)
        deviceList.push('0013a200' + String(Math.floor(Math.random() * 90000000) + 10000000));

    for (var i = startDate; i < endDate; i += 300000) {
        var temps = [];
        deviceList.forEach(function(device, index) {
            var date = new Date(i);
            var val = 15 - 5 * Math.cos(2 * Math.PI / 24 * (date.getHours() + date.getMinutes() / 60)) - 20 * Math.cos(2 * Math.PI / 12 * (date.getMonth() + date.getDate() / 31)) + (Math.random() - 0.5);
            if (index === 1 && i < (startDate + (endDate - startDate) / 3)) val = null;
            else if (index === 2 && i > (endDate - (endDate - startDate) / 3)) val = null;
            else if (Math.random() < 0.1) val = null;
            debugger;
            if (val) temps.push({
                deviceID: device,
                value: val.toFixed(2)
            });
        });
        data.push({
            time: i,
            temperatures: temps
        });
    };
    return data;
}
