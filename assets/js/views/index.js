define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','tween','sl/vdom'],function (require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var VirtualDom=require('sl/vdom');


    var tween=require('tween');

    return Activity.extend({
        template: 'views/index.html',

        events: {
            'tap': function () {
                // this.$('.main,.scroll').iScroll('refresh');
            },

            'tap .js_buy': function () { },
            'tap .js_create': function () {
                if(!this.slider) {
                    sl.tip('T恤尚未载入，请稍候');
                } else {
                    var data=this.slider.data();

                    util.store('product',data);

                    this.forward('/create/'+data.WorkID+'.html');
                }
            },
            'tap .js_buy': function () {
                var data=this.slider.data();

                util.store('product',data);
                this.forward('/product/'+data.WorkID+'.html');
            }
        },

        swipeRightForwardAction: '/menu/index.html',

        //useScroll: true,

        onCreate: function () {
            var that=this;

            /*
            var testlist=[];

            window.test=function () {

            var now=Date.now();

            var frag=document.createDocumentFragment();

            for(var i=0;i<10000;i++) {
            var el=document.createElement('DIV');
            el.innerHTML='asdf';

            testlist.push(el);

            frag.appendChild(el);
            }

            document.body.appendChild(frag)

            console.log(Date.now()-now);

            }

            window.test1=function () {

            console.log(testlist.length);

            var now=Date.now();

            for(var i=0,n=testlist.length;i<n;i++) {
            document.body.removeChild(testlist[i])
            }

            console.log(Date.now()-now);

            }

            window.test2=function () {

            console.log(testlist.length);

            var now=Date.now();

            for(var i=0,n=testlist.length;i<n;i++) {
            testlist[i].style.display='none'
            }

            console.log(Date.now()-now);

            }
            */

            var vdom=new VirtualDom(this.el);

            var list=[];

            for(var i=0;i<10000;i++) {
                list.push(this.razor.helper.test());
            }

            var now=Date.now();

            var nodeList=vdom.add({
                top: 50,
                left: 0,
                marginTop: 50,
                width: 0,
                scrollTop: 50,
                list: list
            });

            vdom.draw();

            console.log(Date.now()-now);

            var that=this,
                $list=that.$('.js_list');

            var userinfo=util.store('USERINFO');
            if(userinfo)
                $.post(bridge.url('/json/user/isLogin'),{
                    Account: userinfo.Account,
                    Auth: userinfo.Auth
                },function (res) {
                    if(!res||!res.returnCode=='0000') util.store('USERINFO',null);
                },'json');

            that.loading=new Loading($list);

            that.loading.load({
                url: '/Json/Product/GetProducts',
                pageIndex: 1,
                pageSize: 5,
                success: function (res) {
                    that.slider=new Slider($list,{
                        data: res.data,
                        itemTemplate: '<div style="position:relative"><img class="home_tee_img" src="@Picture" onerror="this.removeAttribute(\'src\')" /><b class="home_buy_btn js_buy""></b><p class="t_info"><span>COMBED COTTON TEE</span> <span>可与皮肤直接接触</span> </p></div>'
                    });
                }
            });


            var anim=tween.prepare([{
                el: this.$('.js_main'),
                css: {
                    opacity: 1,
                    translate: '25%,30%',
                    scale: '2,1'
                },
                duration: 1000,
                finish: function () {
                }
            },{
                el: this.$('.js_list'),
                css: {
                    opacity: 1,
                    translate: '30%,0%',
                    scale: '1,2'
                },
                duration: 1000,
                finish: function () {
                }
            },{
                el: this.$('.js_list1'),
                css: {
                    opacity: 1,
                    translate: '30%,0%',
                    scale: '1,2'
                },
                duration: 1000,
                finish: function () {
                }
            }]);

            setTimeout(function () {
                //anim.step(50);

                setTimeout(function () {
                    //anim.animate(500,0);

                },3000)

            },300)

            function run() {
                tween.parallel([{
                    el: '.js_main',
                    css: {
                        opacity: .5,
                        translate: '15%,10%',
                        scale: '1,.5'
                    },
                    duration: 1000,
                    finish: function () {

                        tween.parallel([{
                            el: '.js_main',
                            css: {
                                opacity: 1,
                                translate: '25%,30%',
                                scale: '2,1'
                            },
                            duration: 1000,
                            finish: function () {
                                run()
                            }
                        },{
                            el: '.js_list',
                            css: {
                                opacity: 1,
                                translate: '30%,0%',
                                scale: '1,2'
                            },
                            duration: 1000,
                            finish: function () {
                            }
                        },{
                            el: '.js_list1',
                            css: {
                                opacity: 1,
                                translate: '30%,0%',
                                scale: '1,2'
                            },
                            duration: 1000,
                            finish: function () {
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
                    finish: function () {
                    }
                },{
                    el: '.js_list1',
                    css: {
                        opacity: .5,
                        translate: '15%,10%',
                        scale: '1,.5'
                    },
                    duration: 1000,
                    finish: function () {
                    }
                }]);
            }
            setTimeout(function () {

                //run()


            },100)
        },
        onShow: function () {
            var that=this;



        },
        onDestory: function () {
        }
    });
});
