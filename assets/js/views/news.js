define('views/news',['zepto','sl/activity','ui/tabs','app','views/loading'],function(require,exports,module) {
    var $=require('zepto'),
        Activity=require('sl/activity'),
        app=require('app'),
        Loading=require('views/loading');

    module.exports=Activity.extend({
        template: 'views/news.html',
        events: {
            'tap .J_Back': 'back'
        },
        onCreate: function() {
            var that=this;

            that.$('#main').loading('load',{
                url: '/api/CPService/queryCpNewsContent/?ct=json&newsid='+that.route.data.id,
                success: function(res) {
                    that.$('#main').html(that.tmpl('article',res));
                }
            });

        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
