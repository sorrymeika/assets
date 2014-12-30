define(['$','util','views/auth','bridge','sl/widget/loading','sl/widget/button'],function (require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');
    var util=require('util');
    var button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/order.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_create': 'createOrder'
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

        getTotal: function () {
            var total=0;
            this.$list.find('[data-id]').each(function () {
                total+=$(this).data("qty")*$(this).data("price");
            });

            this.$('.js_amount').html("￥"+total);
            this.$('.js_total').html("￥"+total);
        },

        loadData: function () {
            var that=this;
            var userInfo=util.store("USERINFO");

            that.loading.load({
                url: '/json/shop/getshoppingcart',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth,
                    ids: util.store('Carts').join(',')
                },
                checkData: false,
                success: function (res) {

                    if(res.success&&res.data&&res.data.length) {
                        that.$list.html(that.tmpl("list",res));

                    } else {
                        that.$list.html('<div class="nodata">您的购物车中暂无商品<br>请去<a href="/">首页</a>选购吧</div>');
                    }
                    that.getTotal();
                }
            });

            that.addressLoading.load({
                url: '/json/user/getaddress',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth
                },
                checkData: false,
                success: function (res) {

                    if(res.success&&res.data&&res.data.length) {
                        var html=[];
                        $.each(res.data,function (i,item) {
                            if(item.IsCommonUse) {
                                html.push('<p><span>姓名</span>'+item.Receiver+"</p>");
                                html.push('<p><span>电话</span>'+(item.Mobile||item.Phone)+"</p>");
                                html.push('<p><span>收货地址</span>'+item.Address+"</p>");
                                that.$('.js_address').data('id',item.AddressID).html(html.join(''));
                                return true;
                            }
                        });


                    } else {
                        that.$('.js_address').html('<div class="nodata">您还未添加收货地址</div>');
                    }
                }
            });
        },

        onDestory: function () {
        },

        createOrder: button.sync(function () {
            var that=this;
            var addressId=that.$('.js_address').data('id');
            var ids=util.store("Carts");

            if(!addressId) {
                sl.tip('您还未添加收货地址');
                return;
            }

            return {
                url: '/json/shop/createorder',
                data: {
                    Account: this.userInfo.Account,
                    Auth: this.userInfo.Auth,
                    AddressID: addressId,
                    PaymentID: 1,
                    Message: util.encodeHTML(that.$('.js_txt_message').val()),
                    Carts: ids.join(',')
                },
                success: function (res) {
                    if(res.success) {
                        that.forward("/order/"+res.orderid+'.html');
                    } else {
                        sl.tip(res.msg);
                    }
                }
            }
        })
    });
});
