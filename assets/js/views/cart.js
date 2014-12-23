define(['$','sl/activity','ui/tabs','app','views/loading'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        app=require('app'),
        Loading=require('sl/widget/loading');

    module.exports=Activity.extend({
        template: 'views/cart.html',
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
