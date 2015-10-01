Template.graph.events({
    'click .btn': function(e) {
        e.preventDefault();
        if (e.target.firstElementChild.id === 'liveUpdate') {
            if (e.target.className.indexOf('active') < 0)
                Template.instance().heartbeatInterval = Meteor.setInterval(function() {
                    Session.set('graphHeartbeat', Date.now());
                }, 500);
            else
                Meteor.clearInterval(Template.instance().heartbeatInterval);
        } else
            setGraphWindow(e.target.firstElementChild.id, Template.instance().graph);
    }
});

Template.graph.onCreated(function() {
    var instance = this;

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
                    dateWindow: [Date.now() - 60 * 60 * 1000, Date.now()],
                    showRangeSelector: true,
                    ylabel: 'Temperature (C)',
                    legend: 'always',
                });
        } else {
            console.log('Updating graph')
            instance.graph.updateOptions({
                'file': instance.temperatures(),
            });
        }
    });

    instance.autorun(function() {
        Session.get('graphHeartbeat');
        console.log('Updating document window')
        var dateWindow = instance.graph.getOption('dateWindow');
        instance.graph.updateOptions({
            dateWindow: [new Date(dateWindow[0]).getTime() + 500, new Date(dateWindow[1]).getTime() + 500]
        });
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
