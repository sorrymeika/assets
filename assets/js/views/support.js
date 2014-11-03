define(['$','ui/sl','app','sl/widget/loading'],function (require,exports,module) {
    var $=require('$'),
        sl=require('sl/sl'),
        app=require('app'),
        Loading=require('sl/widget/loading');

    module.exports=sl.Activity.extend({
        template: 'views/support.html',
        events: {},
        onCreate: function () {
            var that=this;

        },
        onStart: function () {
        },
        onResume: function () {
        },
        onDestory: function () {
        }
    });
});
