define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','tween'],function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var tween=require('tween');

    return Activity.extend({
        template: 'views/index.html',

        events: {
            'tap': function() {
                // this.$('.main,.scroll').iScroll('refresh');
            },

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

        //useScroll: true,

        onCreate: function() {
            var that=this,
                $list=that.$('.js_list');

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
                        itemTemplate: '<div style="position:relative"><img class="home_tee_img" src="${Picture}" onerror="this.removeAttribute(\'src\')" /><b class="home_buy_btn js_buy""></b><p class="t_info"><span>COMBED COTTON TEE</span> <span>可与皮肤直接接触</span> </p></div>'
                    });
                }
            });
        },
        onShow: function() {

            function run() {
                tween.parallel([{
                    el: '.js_main',
                    css: {
                        opacity: .5,
                        translate: '15%,10%',
                        scale: '1,.5'
                    },
                    duration: 1000,
                    finish: function() {

                        tween.parallel([{
                            el: '.js_main',
                            css: {
                                opacity: 1,
                                translate: '25%,30%',
                                scale: '2,1'
                            },
                            duration: 1000,
                            finish: function() {
                                //run()
                            }
                        },{
                            el: '.js_list',
                            css: {
                                opacity: 1,
                                translate: '30%,0%',
                                scale: '1,2'
                            },
                            duration: 1000,
                            finish: function() {
                            }
                        },{
                            el: '.js_list1',
                            css: {
                                opacity: 1,
                                translate: '30%,0%',
                                scale: '1,2'
                            },
                            duration: 1000,
                            finish: function() {
                            }
                        }]);
                    }
                },{
                    el: '.js_list',
                    css: {
                        opacity: .5,
                        translate: '15%,10%',
                        scale: '1,.5'
                    },
                    duration: 1000,
                    finish: function() {
                    }
                },{
                    el: '.js_list1',
                    css: {
                        opacity: .5,
                        translate: '15%,10%',
                        scale: '1,.5'
                    },
                    duration: 1000,
                    finish: function() {
                    }
                }]);
            }
            setTimeout(function() {

                //run()


            },100)

        },
        onDestory: function() {
        }
    });
});
