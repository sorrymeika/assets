define('views/menu',['zepto','sl/activity','bridge'],function(require,exports,module) {
    var $=require('zepto'),
        Activity=require('sl/activity'),
        bridge=require('bridge');

    module.exports=Activity.extend({
        template: 'views/menu.html',
        events: {
            'tap': function(e) {
                if($(e.target).hasClass('view')) {
                    this.back();
                }
            }
        },
        className: 'transparent',
        animationName: 'menu',
        //swipeLeftBackAction: '/',
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
