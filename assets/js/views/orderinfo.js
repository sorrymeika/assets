define(['$','util','views/auth','bridge','sl/widget/loading','sl/widget/button'],function (require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');
    var util=require('util');
    var button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/orderinfo.html',
        events: {
            'tap .js_back': function () {
                this.back('/');
            },
            'tap .js_pay': 'pay'
        },
        onCreate: function () {
            var that=this;

            that.$list=that.$('.js_list');
            that.loading=new Loading(that.$('.js_main'));
            that.addressLoading=new Loading(that.$('.js_address'));

            var userInfo=util.store("USERINFO");

            that.onActivityResult('login',function () {
                that.loadData();
            });

            if(userInfo) {
                that.loadData();
            }
        },


        loadData: function () {
            var that=this;
            var userInfo=util.store("USERINFO");

            that.loading.load({
                url: '/json/shop/getorder',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth,
                    OrderID: that.route.data.id
                },
                checkData: false,
                success: function (res) {
                    var status=["已退款","退款中","已取消","未付款","已付款","已确认制作中","已发货","交易完成"]

                    if(res.success&&res.data) {
                        var item=res.data;

                        that.$list.html(that.tmpl("list",{ data: item.Details }));

                        var html=[];
                        html.push('<p><span>姓名</span>'+item.Receiver+"</p>");
                        html.push('<p><span>电话</span>'+(item.Mobile||item.Phone)+"</p>");
                        html.push('<p><span>收货地址</span>'+item.Address+"</p>");
                        that.$('.js_address').html(html.join(''));

                        that.$('.js_message').html(status[item.Status+3]);
                        that.$('.js_amount').html("￥"+item.Amount);
                        that.$('.js_freight').html("￥"+item.Freight);
                        that.$('.js_total').html("￥"+item.Total);

                        if(item.Status==0) {
                            that.$('.js_action').show();
                        }
                    }
                }
            });

        },

        onDestory: function () {
        },

        pay: function () {
        }
    });
});
