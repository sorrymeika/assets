define(['$','util','bridge','sl/base','sl/activity','sl/widget/button'],function (require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        Activity=require('sl/activity'),
        button=require('sl/widget/button');

    module.exports=Activity.extend({
        template: 'views/registerS1.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_continue': 'register'
        },
        onCreate: function () {
            var that=this;
        },
        onStart: function () {
        },
        onResume: function () {
        },
        onDestory: function () {
        },

        register: button.sync(function (e) {
            var that=this;
            var mobile=this.$('.js_mobile').val();

            if(!account) {
                sl.tip('请输入手机号');
                return;
            }

            if(!util.validateMobile(mobile)) {
                sl.tip('请输入正确的手机号');
                return;
            }

            var registerInfo=util.store('register');
            if(!registerInfo) {
                this.back('/register.html');
                return;
            }

            registerInfo.mobile=mobile;
            util.store('register',registerInfo);

            return {
                url: '/json/user/sendsms',
                data: {
                    mobile: mobile
                },
                success: function (res) {
                    if(res.success) {
                        that.forward('/registerS2.html');
                    } else {
                        sl.tip(res.msg);
                    }
                }
            }
        })
    });
});
