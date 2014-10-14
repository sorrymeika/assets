define('views/news',['zepto','ui/sl','ui/tabs','app','views/loading'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Loading=require('views/loading');

    module.exports=sl.Activity.extend({
        template: 'views/news.html',
        events: {
            'tap .J_Back': 'back'
        },
        onCreate: function () {
            var that=this;

            that.$('#main').loading('load',{
                url: '/api/CPService/queryCpNewsContent/?ct=json&newsid='+that.route.data.id,
                success: function (res) {
                    that.$('#main').html(that.tmpl('article',res));
                }
            });

        },
        onStart: function () {
        },
        onResume: function () {
        },
        onDestory: function () {
        }
    });
});
