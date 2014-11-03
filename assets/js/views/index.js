define(['$','sl/sl','app'],function(require,exports,module) {
    var $=require('$'),
        sl=require('sl/sl'),
        app=require('app');

    module.exports=sl.Activity.extend({
        template: 'views/index.html',

        onCreate: function() {
            var that=this;
        },
        onStart: function() {
        },
        onResume: function() {
            console.log("index onResume");
        },
        onDestory: function() {
            console.log("index onDestory");
        }
    });
});
