define(['$','util','views/auth','bridge','sl/widget/loading','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');
    var util=require('util');
    var button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/cart.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_list li[data-id]': function(e) {
                var $target=$(e.currentTarget);
                $target.find('.checkbox').toggleClass('checked');
                this.getTotal();
            },
            'tap .js_select_all': function(e) {
                var $target=$(e.currentTarget);
                $target.closest('.cartwrap').find('.checkbox').addClass('checked');
                this.getTotal();
            },
            'tap .js_check': function(e) {
                var $target=$(e.currentTarget);
                $target.toggleClass('checked');
                $target.closest('.cartwrap').find('.checkbox')[$target.hasClass('checked')?'addClass':'removeClass']('checked');
                this.getTotal();
            },
            'tap .js_delete': 'deleteCarts',
            'tap .js_create': 'createOrder'
        },
        onCreate: function() {
            var that=this;

            that.$list=that.$('.js_list');
            that.loading=new Loading(that.$('.js_main'));
        },

        onShow: function() {
            if(util.store("USERINFO")) {
                this.loadData();
            }
        },

        loadData: function() {
            var that=this;
            var userInfo=util.store("USERINFO");

            that.loading.load({
                url: '/json/shop/getshoppingcart',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth
                },
                checkData: false,
                success: function(res) {

                    if(res.success&&res.data&&res.data.length) {
                        that.$list.html(that.tmpl("list",res));

                    } else {
                        that.$list.html('<div class="nodata">您的购物车中暂无商品<br>请去<a href="/">首页</a>选购吧</div>');
                    }
                }
            });
        },

        onDestory: function() {
        },

        getTotal: function() {
            var total=0;
            this.$('.js_list .checked').each(function() {
                total+=$(this).data("qty")*$(this).data("price");
            });

            this.$('.js_amount').html("￥"+total);
            this.$('.js_total').html("￥"+total);
        },

        createOrder: function() {
            var that=this;
            var ids=[];

            that.$('.js_list .checked').each(function() {
                ids.push($(this).data('id'));
            });

            if(ids.length==0) {
                sl.tip('请选择需要购买的商品');
                return;
            }

            util.store("Carts",ids);

            this.forward("/order.html");
        },

        deleteCarts: function() {
            var that=this;
            var ids=[];
            var items=$('');
            var userInfo=util.store("USERINFO");

            that.$('.js_list .checked').each(function() {
                ids.push($(this).data('id'));
                items=items.add($(this).closest('li'));
            });

            var count=items.length;
            items.css({
                overflow: 'hidden',
                height: items.height()
            });
            items.animate({
                height: 0,
                margin: 0,
                padding: 0
            },300,'ease',function() {
                $(this).remove();
                count--;
                if(count==0&&!that.$('.js_list').children().length) {
                    that.$list.html('<div class="nodata">您的购物车中暂无商品<br>请去<a href="/">首页</a>选购吧</div>');
                }
            });

            that.loading.load({
                url: '/json/shop/deleteShoppingCart',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth,
                    CartID: ids.join(',')
                },
                checkData: false,
                success: function(res) { }
            });
        }
    });
});
