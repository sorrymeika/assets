define(['$','views/auth','bridge','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');

    module.exports=AuthActivity.extend({
        template: 'views/cart.html',
        events: {
            'tap .js_back': 'back'
        },
        onCreate: function() {
            var that=this;
        },
        onDestory: function() {
        }
    });
});
