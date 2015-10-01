Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    waitOn: function() {
        return Meteor.subscribe('temperatures');
    }
});

Router.route('/', {
    name: 'graph'
});

Router.route('/heatmap', {
    name: 'heatmap'
});