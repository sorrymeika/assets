define(['$','sl/activity','bridge'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        bridge=require('bridge'),
        util=require('util');

    module.exports=Activity.extend({
        template: 'views/credit.html',
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