define('views/newsList',['$','ui/sl','app','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        sl=require('sl/sl'),
        app=require('app'),
        Loading=require('sl/widget/loading');

    module.exports=sl.Activity.extend({
        template: 'views/newsList.html',
        events: {},
        onCreate: function() {
            var that=this;
            that.$el.loading('load',{
                url: '',
                success: function(res) {
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
