Template.graph.events({
    'click .btn': function(e) {
        e.preventDefault();
        setInterval(setGraphWindow($(e.target).children()[0].id, Template.instance().graph), 1000);
    }
});


Template.graph.onCreated(function() {
    var instance = this;

    instance.startDate = new ReactiveVar(Date.now() - 60 * 60 * 1000);
    instance.subscription = instance.subscribe('temperatures');

    instance.temperatures = function() {
        return Temperatures.find().map(function(doc) {
            var values = doc.temperatures.map(getValues);
            return [new Date(doc.time), [average(values), standardDeviation(values)]];
        });
    }
});

Template.graph.onRendered(function() {
    var instance = this;

    instance.autorun(function(c) {
        if (c.firstRun) {
            instance.graph = new Dygraph(
                document.getElementById('graph'), instance.temperatures(), {
                    labels: ['Date', 'Temperature'],
                    labelsDivStyles: {
                        'textAlign': 'right'
                    },
                    title: 'Temperature in PHO117',
                    rollPeriod: 10,
                    showRoller: true,
                    errorBars: true,
                    fillAlpha: 0.25,
                    showRangeSelector: true,
                    ylabel: 'Temperature (C)',
                    legend: 'always'
                });
        } else {
            if (instance.subscription.ready())
                instance.graph.updateOptions({
                    'file': instance.temperatures(),
                });
        }
    });
});

function setGraphWindow(windowDuration, graph) {
    var dateWindow;
    switch (windowDuration) {
        case 'hour':
            dateWindow = [new Date().setHours(new Date().getHours() - 1), new Date()];
            break;
        case 'day':
            dateWindow = [new Date().setDate(new Date().getDate() - 1), new Date()];
            break;
        case 'week':
            dateWindow = [new Date().setDate(new Date().getDate() - 7), new Date()];
            break;
        case 'month':
            dateWindow = [new Date().setMonth(new Date().getMonth() - 1), new Date()];
            break;
        case 'all':
            dateWindow = null;
    }
    graph.updateOptions({
        dateWindow: dateWindow
    });
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
