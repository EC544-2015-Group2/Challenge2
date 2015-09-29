Template.graph.events({
    'click .btn': function(e) {
        e.preventDefault();
        var startDate = new Date();
        switch ($(e.target).children()[0].id) {
            case 'hour':
                startDate.setHours(startDate.getHours() - 1);
                break;
            case 'day':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setYear(startDate.getYear() - 1);
                break;
            case 'all':
                startDate.setTime(0);
        }
        Template.instance().startDate.set(startDate.getTime());
        console.log(Template.instance().startDate.get());
    }
});


Template.graph.onCreated(function() {
    var instance = this;

    instance.startDate = new ReactiveVar(Date.now() - 60 * 60 * 1000);

    instance.autorun(function() {
        instance.subscription = instance.subscribe('temperatures');
    });

    instance.temperatures = function() {
        return Temperatures.find({
            time: {
                $gt: instance.startDate.get()
            }
        }).map(function(doc) {
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
            // console.log(instance.temperatures().slice(0,1));
            if (instance.subscription.ready())
                instance.graph.updateOptions({
                    'file': instance.temperatures(),
                    dateWindow: null
                });
        }
    });
});

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
