define(['$','sl/activity','bridge'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        app=require('app'),
        util=require('util');

    module.exports=Activity.extend({
        template: 'views/credits.html',
        events: {},
        onCreate: function() {
            var that=this;

        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });;
});