﻿define(['$','sl/activity','app'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        app=require('app'),
        util=require('util');

    module.exports=Activity.extend({
        template: 'views/about.html',
        events: {},
        onCreate: function() {
            var that=this;

        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });;
});