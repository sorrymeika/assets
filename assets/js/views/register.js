define(['$','util','bridge','sl/base','sl/activity','sl/widget/button'],function (require,exports,module) {
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
            'tap .js_continue': 'register',
            'tap .licence': function (e) {
                var $target=$(e.currentTarget);
                $target.find('.checkbox').toggleClass('checked');
            }
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

        register: function (e) {
            var that=this;
            var account=this.$('.js_account').val();

            if(!account) {
                sl.tip('请输入EMAIL');
                return;
            }

            if(!util.validateEmail(account)) {
                sl.tip('请输入正确的EMAIL');
                return;
            }

            util.store('register',{
                account: account
            });

            this.forward('/registerS1.html');
        }
    });
});
