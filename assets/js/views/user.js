define('views/user',['$','ui/sl','app','sl/widget/loading'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('sl/sl'),
        app=require('app'),
        Loading=require('sl/widget/loading');

    module.exports=sl.Activity.extend({
        template: 'views/user.html',
        events: {},
        onCreate: function () {
            var that=this;
        },
        onStart: function () {
        },
        toLogin: function () {
            this.redirect('/login.html?r='+encodeURIComponent('/user.html'));
        },

        onShow: function () {

            var that=this,
                userinfo=localStorage.getItem('USERINFO');

            if(!userinfo) {
                that.toLogin();
            } else {
                !that.loading&&(that.loading=new Loading(that.$el));

                that.loading.load({
                    url: '/json/user/islogin',
                    success: function (res) {
                        that.toLogin();
                    },
                    error: function (res) {
                        if(res.returnCode==='0000') {
                            that.forward('/login.html');
                        } else {
                            sl.tip(res.msg||'网络错误')
                        }
                        this.hideLoading();
                    }
                });
            }

        },
        onDestory: function () {
            this.loading&&this.loading.destory();
        }
    });
});