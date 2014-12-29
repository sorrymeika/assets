define(['$','util','bridge','sl/base','sl/activity','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        Activity=require('sl/activity'),
        button=require('sl/widget/button');

    module.exports=Activity.extend({
        template: 'views/password.html',
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
            var password=this.$('.js_password').val();
            var password1=this.$('.js_password1').val();

            if(!password) {
                sl.tip('请输入密码');
                return;
            }
            if(password1!=password) {
                sl.tip('请再次输入密码');
                return;
            }

            var registerInfo=util.store('register');
            if(!registerInfo) {
                this.back('/register.html');
                return;
            }

            return {
                url: '/json/user/register',
                data: {
                    mobile: registerInfo.mobile,
                    account: registerInfo.account,
                    password: password
                },
                success: function(res) {
                    if(res.success) {
                        sl.tip('恭喜，注册成功！');
                        util.store("USERINFO",res.userinfo);
                        that.back('/');
                    } else {
                        sl.tip(sl.msg);
                    }
                }
            }
        })
    });
});
