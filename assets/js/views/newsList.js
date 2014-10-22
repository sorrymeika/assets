define('views/newsList',['$','ui/sl','app'],function (require,exports,module) {
    var $=require('$'),
        sl=require('sl/sl'),
        app=require('app');

    module.exports=sl.Activity.extend({
        template: 'views/newsList.html',
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
