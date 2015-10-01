Template.heatmap.onCreated(function() {
    var instance = this;

    instance.sensorList = new Mongo.Collection(null);
    instance.sensorList.insert({
        deviceID: '0013a20000000000',
        xVal: 100,
        yVal: 150
    });
    instance.sensorList.insert({
        deviceID: '0013a20000000001',
        xVal: 250,
        yVal: 100
    });
    instance.sensorList.insert({
        deviceID: '0013a20000000002',
        xVal: 150,
        yVal: 200
    });
    instance.sensorList.insert({
        deviceID: '0013a20000000003',
        xVal: 250,
        yVal: 300
    });

});


Template.heatmap.onRendered(function() {
    var instance = this;

    instance.grid = function() {
        var temperatures = Temperatures.findOne({}, {
            sort: {
                time: -1
            }
        }).temperatures;
        var data = [temperatures.map(function(item) {
            return item.value;
        }), temperatures.map(function(item) {
            return instance.sensorList.findOne({
                deviceID: item.deviceID
            }).xVal;
        }), temperatures.map(function(item) {
            return instance.sensorList.findOne({
                deviceID: item.deviceID
            }).yVal;
        })];
        var fitModel = kriging.train(data[0], data[1], data[2], 'gaussian', 0, 100);
        grid = [];
        for (var i = 0; i <= 400; i += 20) {
            var row = [];
            for (var j = 0; j <= 400; j += 20)
                row.push(kriging.predict(i, j, fitModel));
            grid.push(row);
        }
        return grid;
    }

    instance.autorun(function() {
        data = instance.grid();
        var maxTemp = Math.max.apply(Math, data.map(function(i) {
            return i[0];
        })) + 5;
        var minTemp = Math.min.apply(Math, data.map(function(i) {
            return i[0];
        })) - 5;

        // Add a "cliff edge" to force contour lines to close along the border.
        var cliff = -1000;
        data.push(d3.range(data[0].length).map(function() {
            return cliff;
        }));
        data.unshift(d3.range(data[0].length).map(function() {
            return cliff;
        }));
        data.forEach(function(d) {
            d.push(cliff);
            d.unshift(cliff);
        });

        var c = new Conrec,
            xs = d3.range(0, data.length),
            ys = d3.range(0, data[0].length),
            zs = d3.range(minTemp, maxTemp, .5),
            width = 600,
            height = 600,
            x = d3.scale.linear().range([0, width]).domain([0, data.length]),
            y = d3.scale.linear().range([height, 0]).domain([0, data[0].length]),
            colours = d3.scale.linear().domain([5, 15]).range(["#fff", "red"]);
        c.contour(data, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs.length, zs);
        d3.select("#heatmap").select("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll("path")
            .data(c.contourList())
            .enter().append("path")
            .style("fill", function(d) {
                return colours(d.level);
            })
            .style("stroke", "black")
            .attr("d", d3.svg.line()
                .x(function(d) {
                    return x(d.x);
                })
                .y(function(d) {
                    return y(d.y);
                }));
    });
});
