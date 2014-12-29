define(['$','util','bridge','sl/base','views/auth','sl/widget/button','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        AuthActivity=require('views/auth'),
        button=require('sl/widget/button');
    var Loading=require('sl/widget/loading');


    module.exports=AuthActivity.extend({
        template: 'views/product.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_select': 'select',
            'tap .js_buy': 'buy'
        },
        onCreate: function() {
            var that=this;
            var data=util.store('product');

            var $content=this.$('.js_content');

            that.data=data;
            that.$('.js_bg').css({ backgroundImage: 'url('+data.Picture+')' });

            this.$('.js_price').html('￥'+data.Price);
            this.$('.js_name').html(data.WorkName+data.ProductName);

            var $color=this.$('.js_color');

            this.$('.js_buy').addClass('disabled');
            this.dialog=this.createDialog({
                isShowClose: true,
                content: 'asdf'
            });
            this.dialog.show();

            that.loading=new Loading($content);
            that.loading.load({
                url: '/json/product/getWork',
                data: {
                    WorkID: data.WorkID
                },
                checkData: false,
                success: function(res) {
                    that.data=res.data;
                    that.$('.js_buy').removeClass('disabled');

                    var colors=[];
                    $.each(res.data.Colors,function(i,color) {
                        colors.push('<i'+(i==0?' class="current"':'')+' data-id="'+color.ColorID+'" style="background-color:'+color.ColorCode+'"></i>');
                    });

                    $color.html(colors.join(''));

                    $content.html(res.data.Content);
                }
            });
        },

        onDestory: function() {
        },

        select: function() {
        },

        buy: button.sync(function() {
            var that=this;
            var data=that.data;

            return {
                url: '/json/shop/addShoppingCart',
                data: {
                    Account: this.userInfo.Account,
                    Auth: this.userInfo.Auth,
                    WorkID: data.WorkID,
                    ProductID: data.ProductID,
                    ColorID: this.$('.js_color .current').data('id'),
                    StyleID: 0,
                    SizeID: 0,
                    Qty: 1,
                    UseDefault: true
                },
                success: function(res) {
                    if(res.success) {
                        sl.tip('加入购物车成功')
                    } else
                        sl.tip(res.msg);
                }
            };
        })
    });
});
