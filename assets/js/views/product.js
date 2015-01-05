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
            'tap .js_back': function() {
                this.back('/')
            },
            'tap .js_select': 'select',
            'tap .js_buy': 'buy',
            'tap .js_color [data-id]:not(.current)': function(e) {
                $(e.currentTarget).addClass('current').siblings('.current').removeClass('current');
            }
        },
        onCreate: function() {
            var that=this;
            var data=util.store('product');

            var $content=this.$('.js_content');

            that.data=data;
            that.$('.js_bg').css({ backgroundImage: 'url('+data.Picture+')' });

            that.$('.js_price').html('￥'+data.Price);
            that.$('.js_name').html(data.WorkName+data.ProductName);

            var $color=that.$('.js_color');

            that.$btn=that.$('.js_buy').addClass('disabled');
            that.dialog=this.createDialog({
                events: {
                    'tap [data-id]:not(.current)': function(e) {
                        $(e.currentTarget).addClass('current').siblings('.current').removeClass('current');
                    }
                },
                isShowClose: true,
                isShowTitle: false,
                content: '',
                buttons: [{
                    text: '确认',
                    click: function() {
                        that.$btn.trigger('tap');
                    }
                }]
            });

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

                    var sizes=['<ul class="productbuy"><li><span>数量</span><input type="number" value="1" /></li><li><span>尺寸</span><p>'];
                    $.each(res.data.Size,function(i,size) {
                        sizes.push('<i'+(i==0?' class="current"':'')+' data-id="'+size.SizeID+'">'+size.SizeName+'</i>')
                    })
                    sizes.push('</p></li></ul>');
                    that.dialog.content(sizes.join(''));
                }
            });
        },

        onResume: function() {
            this.dialog.hide();
        },

        onDestory: function() {
        },

        select: function() {
            this.dialog.show();
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
                    ColorID: that.$('.js_color .current').data('id'),
                    SizeID: that.dialog.$('i.current').data('id'),
                    StyleID: 0,
                    Qty: 1,
                    UseDefault: true
                },
                success: function(res) {
                    if(res.success) {
                        sl.tip('加入购物车成功');
                        that.dialog.hide();
                    } else
                        sl.tip(res.msg);
                }
            };
        })
    });
});
