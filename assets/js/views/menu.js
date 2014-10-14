define('views/menu',['zepto','ui/sl','app','views/loading'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Loading=require('views/loading');

    module.exports=sl.Activity.extend({
        className: 'view transparent',
        template: 'views/menu.html',
        animateInClassName: 'anim-left-in',
        animateOutClassName: 'anim-left-out',
        events: {
            'tap': 'toBack',
            'swipeLeft': 'back',
            'tap .J_Index': function() {
                this.to('/');
            },
            'tap .J_User': function() {
                var that=this;

                if(localStorage.authCookies) {

                    that.to('/user.html');
                } else
                    app.exec('login',function(res) {
                        localStorage.auth=JSON.stringify(res);
                        localStorage.UserName=res.UserName;
                        localStorage.authCookies=".ASPXCOOKIEWebApi="+res[".ASPXCOOKIEWebApi"]+"; ASP.NET_SessionId="+res["ASP.NET_SessionId"];

                        that.to('/user.html');
                    });
            },
            'tap .J_Prize': function() {
                this.to('/prizeList.html');
            },
            'tap .J_News': function() {
                this.to('/newsList.html',{
                    easingIn: this.animateInClassName,
                    easingOut: this.animateOutClassName
                });
            },
            'tap .J_Signout': function(e) {
                var that=this;

                if(!localStorage.authCookies) {
                    app.exec('login',function(res) {
                        localStorage.auth=JSON.stringify(res);
                        localStorage.UserName=res.UserName;
                        localStorage.authCookies=".ASPXCOOKIEWebApi="+res[".ASPXCOOKIEWebApi"]+"; ASP.NET_SessionId="+res["ASP.NET_SessionId"];

                        that.to('/');
                    });

                } else {
                    that.$('.J_Signout').css({ position: 'relative' }).loading('load',{
                        url: '/api/AccService/Logout',
                        check: false,
                        checkData: false,
                        success: function(res) {
                            if(res.StatusCode=='0') {
                                localStorage.authCookies='';
                                localStorage.auth='';
                                localStorage.UserName='';

                                sl.tip('退出成功！');
                                $(e.currentTarget).html('登录');
                            } else {
                                sl.tip(res.ErrorMessage);
                            }
                        },
                        error: function() {
                            this.hide();
                            sl.tip('网络错误！');
                        }
                    });
                }
            },
            'tap .J_CheckUpdate': function(e) {
                var that=this;

                that.$('.J_CheckUpdate').addClass('ico_loading');

                sl.checkUpdate()
                    .done(function(downloadUrl,versionName) {

                        if(app.versionName!=versionName)
                            sl.confirm({
                                title: '检查更新',
                                content: '发现了新版本,是否更新',
                                okText: '立即更新'

                            },function() {
                                app.update(downloadUrl,versionName);

                            },function() {
                            });
                        else {
                            sl.tip("已是最新版本");
                        }
                        that.$('.J_CheckUpdate').removeClass('ico_loading');
                    })
                    .fail(function(res) {
                        that.$('.J_CheckUpdate').removeClass('ico_loading');
                        sl.tip(res);
                    });
            }
        },
        toBack: function(e) {
            if($(e.target).hasClass('view')) {
                this.back();
            }
        },
        onCreate: function() {
            var that=this;

            that.onResume();
        },
        playUnderlayer: function(underlayer) {
            underlayer.$el.addClass('stop');
        },
        onStart: function() {
        },
        onResume: function() {
            var that=this;

            var $signout=that.$('.J_Signout').css({ position: 'relative' }).show().html(localStorage.authCookies?'退出':'登录');
            if(localStorage.authCookies)
                $signout.loading('load',{
                    url: '/api/AccService/QueryLoginStatus',
                    check: false,
                    checkData: false,
                    success: function(res) {
                        if(res.ReturnCode!='00000') {
                            localStorage.authCookies='';
                            localStorage.auth='';
                            localStorage.UserName='';

                            that.$('.J_Signout').html('登录');
                        }
                    }
                });
        },
        onDestory: function() {
        }
    });
});
