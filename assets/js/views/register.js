define(['$','util','bridge','sl/base','sl/activity','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        Activity=require('sl/activity'),
        button=require('sl/widget/button');

    module.exports=Activity.extend({
        template: 'views/register.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_register': 'register'
        },
        onCreate: function() {
            var that=this;
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        },

        register: button.sync(function(e) {
            var that=this;

            var data={
                account: $.trim(this.$('.js_account').val()),
                password: $.trim(this.$('.js_password').val())
            }

            if(!data.account) {
                sl.tip('请输入登录账号');
                return;
            }
            if(!data.password) {
                sl.tip('请输入密码');
                return;
            }

            return {
                url: '/json/user/login',
                data: data,
                success: function(res) {
                    if(res.success) {
                        util.store("USERINFO",res.userinfo);
                        that.setResult('login');
                        that.back();
                    } else {
                        sl.tip(res.msg);
                    }
                }
            }

        })
    });
});
