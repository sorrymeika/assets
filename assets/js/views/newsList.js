define('views/newsList',['zepto','ui/sl','app'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app');

    module.exports=sl.Activity.extend({
        template: 'views/newsList.html',
        events: {
            'tap .J_Back': function () {
                this.to('/');
            },
            'tap .J_List [data-id]': 'toSub'
        },
        toSub: function (e) {
            var $target=$(e.currentTarget),
                id=$target.attr('data-id');

            this.to('/newsSubList/'+id+'.html');
        },
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
