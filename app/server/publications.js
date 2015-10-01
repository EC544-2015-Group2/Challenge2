    Meteor.publish('temperatures', function() {
        return Temperatures.find();
    });