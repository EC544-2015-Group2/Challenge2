// data from database, format: [datetime, average, sensor1, sensor2, sensor3, sensor4]
var tempData = [];
tempData.push([new Date(2314, 2, 15), 100, 80, 110, 85, 96, 104]);
tempData.push([new Date(2314, 2, 16), 120, 95, 80, 90, 113, 124]);
tempData.push([new Date(2314, 2, 17), 130, 105, 140, 100, 117, 133]);
tempData.push([new Date(2314, 2, 18), 90, 85, 95, 85, 88, 92]);
tempData.push([new Date(2314, 2, 19), 70, 74, 63, 67, 69, 70]);
tempData.push([new Date(2314, 2, 20), 30, 39, 22, 21, 28, 34]);
tempData.push([new Date(2314, 2, 21), 80, 77, 83, 70, 77, 85]);
tempData.push([new Date(2314, 2, 22), 100, 90, 110, 85, 95, 102]);

google.load('visualization', '1', {'packages':['corechart']});
google.load('visualization', '1', {'packages':['gauge']});
google.setOnLoadCallback(drawChart);

function drawChart() {
    if(tempData.length == 0){
        alert("No date during this period!");
    }

    // draw interval charts
    var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Time');
    data.addColumn('number', 'Temperature');
    data.addColumn({id:'Average', type:'number', role:'interval'});
    data.addColumn({id:'Sensor1', type:'number', role:'interval'});
    data.addColumn({id:'Sensor2', type:'number', role:'interval'});
    data.addColumn({id:'Sensor3', type:'number', role:'interval'});
    data.addColumn({id:'Sensor4', type:'number', role:'interval'});

    // put data into datatable
    data.addRows(tempData);

    // The intervals data as narrow lines (useful for showing raw source data)
    var options_lines = {
        curveType: 'function',
        lineWidth: 4,
        intervals: { 'style':'line' },
        legend: 'none'
    };

    var chart_lines = new google.visualization.LineChart(document.getElementById('chart_lines'));
    chart_lines.draw(data, options_lines);


    // draw gauge chart
    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Temperature', 25.6]
    ]);

    var options = {
        width: 400, height: 120,
        redFrom: 90, redTo: 100,
        yellowFrom:75, yellowTo: 90,
        minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('chart_gauge'));

    chart.draw(data, options);

    // refresh dashboard every two seconds
    setInterval(function() {
        // write code to get data from mongodb in order to refresh dashboard

        // data.setValue(row, column, value)
        data.setValue(0, 1, 10);
        chart.draw(data, options);
        // current refresh period: 2s
    }, 2000);

  }

function getDataWithinRange() {
    var txtStartDate = document.getElementById('txtStart');
    var txtEndDate = document.getElementById('txtEnd');

    var startDate = Date.parse(txtStartDate.text);
    var endDate = Date.parse(txtEndDate.text);

    if(startDate != NaN && endDate != NaN){
        // write query to get data from database within this date range...
    }
}

function getData(id) {
    if(id == 'history'){
        document.getElementById('dvDatePicker').style.display = 'block';
    }
    else{
        document.getElementById('dvDatePicker').style.display = 'none';
    }

    switch (id){
        // write query after each case
        case 'day':
            return;
        case 'week':
            tempData.push([new Date(2314, 2, 23), 70, 74, 63, 67, 69, 70]);
            drawChart();
            return;
        case 'month':
            return;
        case 'history':
            return;
    }

}