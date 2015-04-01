define(['$','sl/activity','bridge','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading');

    module.exports=Activity.extend({
        template: 'views/support.html',
        events: {},
        //swipeRightBackAction: '/',
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
