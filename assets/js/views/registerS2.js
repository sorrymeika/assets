﻿define(['$','util','bridge','sl/base','sl/activity','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        Activity=require('sl/activity'),
        button=require('sl/widget/button');

    module.exports=Activity.extend({
        template: 'views/registerS2.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_continue': 'register'
        },
        onCreate: function() {
            var that=this;
            var registerInfo=util.store('register');

            this.$('.js_mobile').html(registerInfo.mobile);
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        },

        register: button.sync(function(e) {
            var that=this;
            var validCode=this.$('.js_validcode').val();

            if(!validCode) {
                sl.tip('请输入验证码');
                return;
            }

            var registerInfo=util.store('register');
            if(!registerInfo) {
                this.back('/register.html');
                return;
            }

            return {
                url: '/json/user/checkValidCode',
                data: {
                    mobile: registerInfo.mobile,
                    validCode: validCode
                },
                success: function(res) {
                    if(res.success) {
                        that.forward('/password.html');
                    } else {
                        sl.tip(res.msg);
                    }
                }
            }
        })
    });
});
