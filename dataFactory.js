var MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://localhost:27017/ZigBeeBaseStation',
    mongoCollection = 'temperatures';

MongoClient.connect(mongoURL, function(err, db) {
    if (err) console.log('Error connecting to MongoDB database: ' + err);
    else
        db.collection(mongoCollection).insert(dataFactory(Date.now() - 2629740000, Date.now(), 4), function(err, res) {
            if (err) console.log(err);
            else console.log('Inserted ' + res.result.n + ' objects into database');
            db.close();
            process.exit(0);
        });
});


function dataFactory(startDate, endDate, numDevices) {
    data = [];
    deviceList = [];
    for (var i = 0; i < numDevices; i++)
        deviceList.push('0013a2000000000' + i);

    for (var i = startDate; i < endDate; i += 300000) {
        console.log(i);
        var temps = [];
        for (var j = 0; j < numDevices; j++) {
            var date = new Date(i);
            var val = 15 - (1 + 2 * Math.random()) * Math.cos(2 * Math.PI / 24 * (date.getHours() + date.getMinutes() / 60)) - 10  * Math.cos(2 * Math.PI / 12 * (date.getMonth() + date.getDate() / 31)) + (Math.random() - 0.5);
            temps.push({
                deviceID: deviceList[j],
                value: val
            });
        }
        // deviceList.forEach(function(device, index) {
        //     var date = new Date(i);
        //     var val = 15 - 5 * Math.cos(2 * Math.PI / 24 * (date.getHours() + date.getMinutes() / 60)) - 20 * Math.cos(2 * Math.PI / 12 * (date.getMonth() + date.getDate() / 31)) + (Math.random() - 0.5);
        //     if (index === 1 && i < (startDate + (endDate - startDate) / 3)) val = null;
        //     else if (index === 2 && i > (endDate - (endDate - startDate) / 3)) val = null;
        //     else if (Math.random() < 0.1) val = null;
        //     debugger;
        //     if (val) temps.push({
        //         deviceID: device,
        //         value: val
        //     });
        // });
        data.push({
            time: i,
            temperatures: temps
        });
    };
    return data;
}
