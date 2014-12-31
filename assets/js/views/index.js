define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider'],function(require,exports,module) {
    var util=require('util')
    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Touch=require('sl/widget/touch'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var Selector=Touch.extend({
        start: function() {
            var that=this;
            that.$items=that.$('li');
            that.length=that.$items.length;
            that.height=that.el.offsetHeight;
            that.minY=0;
            that.minY=that.height* -1;
            that.maxY=that.height;
            return true;
        },
        move: function(x,y) {
            var that=this;
            y/that.maxY
            console.log(y/that.maxY*360);
            var rotateX=y/that.maxY*180;

            this.$con.css({ '-webkit-transform': 'rotateX('+rotateX+'deg)' });
        },

        initialize: function() {
            this.$con=this.$('ul');
        }
    });

    return Activity.extend({
        template: 'views/index.html',

        events: {
            'tap .js_buy': function() { },
            'tap .js_create': function() {
                if(!this.slider) {
                    sl.tip('T恤尚未载入，请稍候');
                } else {
                    var data=this.slider.data();

                    util.store('product',data);

                    this.forward('/create/'+data.WorkID+'.html');
                }
            },
            'tap .js_buy': function() {
                var data=this.slider.data();

                util.store('product',data);
                this.forward('/product/'+data.WorkID+'.html');
            }
        },

        onCreate: function() {
            var that=this,
                $list=that.$('.js_list');

            new Selector(that.$('.selector'));

            var userinfo=util.store('USERINFO');
            if(userinfo)
                $.post(bridge.url('/json/user/isLogin'),{
                    Account: userinfo.Account,
                    Auth: userinfo.Auth
                },function(res) {
                    if(!res||!res.returnCode=='0000') util.store('USERINFO',null);
                },'json');

            that.loading=new Loading($list);

            that.loading.load({
                url: '/Json/Product/GetProducts',
                pageIndex: 1,
                pageSize: 5,
                success: function(res) {

                    that.slider=new Slider($list,{
                        data: res.data,
                        itemTemplate: '<div style="position:relative"><img class="home_tee_img" src="${Picture}" onerror="this.removeAttribute(\'src\')" /><b class="home_buy_btn js_buy""></b></div>'
                    });
                }
            });

            $('.selector').on('touchstart',function(e) {
                var that=this;
                var point=e.touches[0];

                that.pointX=point.pageX;
                that.pointY=point.pageY;
                that.isMoved=0;
            })
        },
        onStart: function() {
        },
        onDestory: function() {
        }
    });
});
