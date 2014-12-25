define(['$','sl/activity','app','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        app=require('app'),
        Loading=require('sl/widget/loading');

    module.exports=Activity.extend({
        template: 'views/support.html',
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
    });
});
