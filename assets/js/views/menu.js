﻿define('views/menu',['zepto','sl/sl','app'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('sl/sl'),
        app=require('app');

    module.exports=sl.Activity.extend({
        template: 'views/menu.html',
        events: {
            'tap .J_Index': function() {
                this.back('',400,this.animationName);
            }
        },
        className: 'transparent',
        animationName: 'menu',
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
