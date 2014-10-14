define('views/login',['zepto','ui/sl','ui/tabs','app','ui/loading'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Loading=require('ui/loading');

    module.exports=sl.Activity.extend({
        template: 'views/login.html',
        events: {
            'tap .J_Back': 'back',
            'tap .J_Login': 'login'
        },
        login: function() {
            var that=this;

            app.exec('login',function(res) {
                localStorage.auth=JSON.stringify(res);
                localStorage.UserName=res.UserName;
                localStorage.authCookies=".ASPXCOOKIEWebApi="+res[".ASPXCOOKIEWebApi"]+"; ASP.NET_SessionId="+res["ASP.NET_SessionId"];

                that.to('/');
            });
        },
        onCreate: function() {
            var that=this;

            that.login();
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
