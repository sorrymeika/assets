define(['$','util','views/auth','bridge','sl/widget/loading','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');
    var util=require('util');
    var button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/orderlist.html',
        events: {
            'tap .js_back': function() {
                this.back('/');
            },
            'tap .js_pay': 'pay'
        },
        onCreate: function() {
            var that=this;

            that.$list=that.$('.js_list');
            that.loading=new Loading(that.$('.js_main'));

            var userInfo=util.store("USERINFO");

            that.onActivityResult('login',function() {
                that.loadData();
            });

            if(userInfo) {
                that.loadData();
            }
        },


        loadData: function() {
            var that=this;
            var userInfo=util.store("USERINFO");

            that.loading.load({
                url: '/json/shop/getorders',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth
                },
                checkData: false,
                success: function(res) {
                    var status=["已退款","退款中","已取消","未付款","已付款","已确认制作中","已发货","交易完成"]

                    if(res.success&&res.data) {
                        $.each(res.data,function(i,data) {
                            data.Status=status[data.Status+3];
                            data.Qty=0;
                            $.each(data.Details,function(j,item) {
                                data.Qty+=item.Qty;
                            })
                        });
                        that.$list.html(that.tmpl("list",res));
                    }
                }
            });

        },

        onDestory: function() {
        },

        pay: function() {
            var that=this;
            var userInfo=util.store("USERINFO");

            bridge.pay({
                url: bridge.url("/pay/"+that.route.data.id+"?Account="+userInfo.Account+"&Auth="+userInfo.Auth),
                orderid: that.route.data.id,
                Account: userInfo.Account,
                Auth: userInfo.Auth
            },function() {
                that.loadData();
            });
        }
    });
});
