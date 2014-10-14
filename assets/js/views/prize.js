define('views/prize',['zepto','ui/sl','ui/tabs','app','views/loading'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Loading=require('views/loading'),
        common=sl.common;

    module.exports=sl.Activity.extend({
        template: 'views/prize.html',
        events: {
            'tap .J_Back': 'back'
        },
        onCreate: function () {
            var that=this;

            that.$('#main').html(that.tmpl('prize',common.Prize));
        },
        onStart: function () {
        },
        onResume: function () {
        },
        onDestory: function () {
        }
    });
});
