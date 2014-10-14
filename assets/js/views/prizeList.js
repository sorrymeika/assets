define('views/prizeList',['zepto','ui/sl','app','views/loading'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Loading=require('views/loading');

    module.exports=sl.Activity.extend({
        template: 'views/prizeList.html',
        events: {
            'tap .J_Back': function() {
                this.to('/');
            },
            'tap .J_List [data-id]': 'toSub'
        },
        toSub: function(e) {
            var $target=$(e.currentTarget),
                id=$target.attr('data-id');

            this.to('/prizeSubList/'+id+'.html');
        },
        onCreate: function() {
            var that=this;

            that.$el.loading('load',{
                url: '/api/CPService/QueryLotteryAnnouncement/?ct=json&gameid=&wagerissue=&qsnum=1',
                success: function(res) {
                    console.log(res);

                    $.each(res.Data,function(i,item) {
                        item.Nums=item.LotteryNum.split(',')
                    });

                    that.$('.J_List').html(that.tmpl('list',res));
                },
                error: function(xhr) {
                    if(xhr.status==500||xhr.status==401) {
                        this.msg('还未登录...');
                        setTimeout(function() {
                            app.exec('login',function(res) {
                                localStorage.auth=JSON.stringify(res);
                                localStorage.UserName=res.UserName;
                                localStorage.authCookies=".ASPXCOOKIEWebApi="+res[".ASPXCOOKIEWebApi"]+"; ASP.NET_SessionId="+res["ASP.NET_SessionId"];

                                that.to('/');
                            });
                        },1000);
                    } else
                        this.msg('网络错误');
                }
            });
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
