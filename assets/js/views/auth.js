define(['$','util','sl/activity','bridge','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        Activity=require('sl/activity'),
        Loading=require('sl/widget/loading');

    return Activity.extend({

        redirectToLogin: function() {
            this.forward('/login.html');
        },
        onShow: function() {
            var that=this;
            var userInfo=util.store("USERINFO");

            if(userInfo==null) {
                this.redirectToLogin();
            }
        }
    });
});
