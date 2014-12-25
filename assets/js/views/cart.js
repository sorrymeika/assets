define(['$','sl/activity','bridge','sl/widget/loading'],function (require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        Activity=require('sl/activity'),
        Loading=require('sl/widget/loading');

    module.exports=Activity.extend({
        template: 'views/cart.html',
        events: {
            'tap .js_back': 'back'
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
