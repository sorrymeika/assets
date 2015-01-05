define(['$','util','bridge','sl/base','views/auth','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('sl/base'),
        AuthActivity=require('views/auth'),
        button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/create.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_continue': 'register',
            'tap .js_select': 'pickImage',
            'tap .js_photo': 'takePhoto',
            'tap .js_edit': 'startAviary',
            'tap .js_ok': 'upload'
        },
        onCreate: function() {
            var that=this;
            var data=util.store('product');

            that.data=data;
            that.$image=that.$('.js_bg img');

            that.$('.js_bg').css({ backgroundImage: 'url('+data.Picture+')' })
        },

        onDestory: function() {
        },

        takePhoto: function() {
            var that=this;

            bridge.takePhoto(function(res) {
                that.image=res.path;
                that.$image.attr('src',res.src);
            });
        },

        pickImage: function() {
            var that=this;

            bridge.pickImage(function(res) {
                that.image=res.path;
                that.$image.attr('src',res.src);
            });
        },

        startAviary: function() {
            var that=this;

            if(!that.image) {
                sl.tip('请先添加一张图片');
                return;
            }

            bridge.exec('startAviary',that.image,function(res) {
                that.$image.attr('src',res.src);
                that.image=res.path;
            });
        },

        register: function(e) {
            var that=this;
        },

        upload: function() {
            var that=this;
            var data=that.data;

            if(!that.image) {
                sl.tip('请先添加一张图片');
                return;
            }
            var userInfo=util.store("USERINFO");

            bridge.post('/json/shop/addShoppingCart',{
                WorkID: data.WorkID,
                ProductID: data.ProductID,
                Qty: 1,
                Account: userInfo.Account,
                Auth: userInfo.Auth,
                ColorID: 0,
                SizeID: 0,
                StyleID: 0,
                Qty: 1

            },{
                Print: that.image
            },function(res) {
                if(res.success) {
                    sl.tip('加入购物车成功')
                } else
                    sl.tip(res.msg);
            });
        }
    });
});
