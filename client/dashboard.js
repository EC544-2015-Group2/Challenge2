var socket = io();
var data = [];

$(document).ready(function() {
    var query = {
        time: {
            $gt: Date.now() - 2629740000,
            $lt: Date.now()
        }
    };
    socket.emit('query', JSON.stringify(query));
    socket.on('data', function(message) {
        data = data.concat(JSON.parse(message).map(function(row) {
            return [new Date(row[0])].concat(row.slice(1));
        }));
        new Dygraph(
            document.getElementById('graph'), data, {
                labels: ['Date', 'Temperature'],
                labelsDivStyles: {
                    'textAlign': 'right'
                },
                title: 'Temperature in PHO117',
                rollPeriod: 5,
                showRoller: true,
                errorBars: true,
                fillAlpha: 0.25,
                showRangeSelector: true,
                ylabel: 'Temperature (C)',
                legend: 'always'
            });
    });
});
