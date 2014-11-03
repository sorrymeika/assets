define(['$','ui/sl','app'],function (require,exports,module) {
    var $=require('$'),
        sl=require('sl/sl'),
        app=require('app'),
        util=require('util');

    module.exports=sl.Activity.extend({
        template: 'views/credit.html',
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
    });;
});