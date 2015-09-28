var socket = io();
var data = [];
var graph = null;

$(document).ready(function() {
    var query = {
        time: {
            $gt: Date.now() - 2629740000,
            $lt: Date.now()
        }
    };
    socket.emit('query', JSON.stringify(query));
    socket.on('data', function(message) {
    	console.log(JSON.parse(message));
        if (JSON.parse(message).length === 2)
            data = data.concat([formatDataRow(JSON.parse(message))]);
        else
            data = data.concat(JSON.parse(message).map(formatDataRow));


        if (!graph) graph = new Dygraph(
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
        else graph.updateOptions({
            'file': data
        });
    });
});

function formatDataRow(row) {
    return [new Date(row[0])].concat(row.slice(1));
};
