define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','sl/widget/selector'],function(require,exports,module) {
    var util=require('util')
    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Touch=require('sl/widget/touch'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var Selector=require('sl/widget/selector');

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

            new Selector({
                data: [{
                    text: 'asdfasdf',
                    value: 'asdf'
                },{
                    text: 'asdfasdf1',
                    value: 'asdf'
                }]
            });

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
        },
        onStart: function() {
        },
        onDestory: function() {
        }
    });
});
