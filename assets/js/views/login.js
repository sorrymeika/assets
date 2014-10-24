define(['$','sl/sl','ui/tabs','app','ui/loading'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('sl/sl'),
        app=require('app'),
        Loading=require('ui/loading');

    module.exports=sl.Activity.extend({
        template: 'views/login.html',
        events: {
            'tap .js_back': 'backToFrom'
        },

        onCreate: function () {
            var that=this;

        },
        onDestory: function () {
        },

        login: function () {
            var that=this,
                r=this.route.query['r'];

            that.redirect(r||'/user.html');
        },

        backToFrom: function () {
            this.back();
        }
    });
});
