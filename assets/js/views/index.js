﻿define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','tween','sl/vdom','sl/images','sl/touch'],function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        Touch=require('sl/touch'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var VirtualDom=require('sl/vdom');
    var ImageCanvas=require('sl/images');

    var tween=require('tween');

    var addScroller=function($el,refresh) {
        var $scroller=$('<div class="sl_scroll_inner" style="width:100%;-webkit-transform: translate(0px,0px) translateZ(0);"></div>').append($el.children()).appendTo($el.html(''));

        if(refresh) {
            $scroller.css({ marginTop: -40 }).prepend('<div style="height:40px;background:#ddd;text-align:center;line-height:40px;">下拉刷新</div>')
        }
        $el.css({ overflow: 'hidden' });

        return $scroller;
    };

    var ScrollView=function(el,options) {

        var that=this,
            touch;

        that.options=$.extend({
            ease: 'ease'
        },options);
        that.$el=$(el);
        that.el=that.$el[0];

        touch=that.touch=new Touch(addScroller(that.$el),that.options)

        touch.on('init',function() {
            var matrix=this.$el.matrix();
            this.y=matrix.ty* -1;
            this.minY=0;
        })
        .on('start',function() {
            this.wapperH=this.el.parentNode.clientHeight;
            this.scrollH=this.el.offsetHeight;
            this.maxY=this.scrollH-this.wapperH;
            this.startScrollTop=this.y;
        })
        .on('starttimereset',function() {
            this.startScrollTop=this.y;
        })
        .on('move',function() {
            var newY=this.startScrollTop+this.deltaY;

            if(newY<this.minY||newY>this.maxY) {
                newY=this.startScrollTop+(this.deltaY/4);
            }
            this.y=newY;

            this.$el.css({ '-webkit-transform': 'translate(0px,'+(this.y)* -1+'px) translateZ(0)' });
        })
        .on('beforemomentum',function() {
            this.addMomentumOptions(this.startScrollTop,this.y,this.minY,this.maxY,window.innerHeight);
        })
        .on('momentum',function(e,a) {
            this.y=a.current;
            this.$el.css({ '-webkit-transform': 'translate(0px,'+(this.y)* -1+'px) translateZ(0)' });
        });

        that.$scroller=touch.$el;
    }


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

        swipeRightForwardAction: '/menu/index.html',

        //useScroll: true,

        onCreate: function() {
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

            for(var i=0;i<10000;i++) {
                //list.push(this.razor.helper.test({ id: i }));
            }

            var imageCanvas=new ImageCanvas(document.getElementsByTagName('canvas')[0]);

            var imageItem=imageCanvas.add({
                top: 50,
                left: 0,
                marginTop: 50,
                width: 100,
                height: 100,
                scrollTop: 50,
                list: ['http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg','http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg']
            });

            //imageCanvas.draw();


            var scrollView=new ScrollView(that.$('.main1'));
            return;

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
                finish: function() {
                }
            },{
                el: this.$('.js_list'),
                css: {
                    opacity: 1,
                    translate: '30%,0%',
                    scale: '1,2'
                },
                duration: 1000,
                finish: function() {
                }
            },{
                el: this.$('.js_list1'),
                css: {
                    opacity: 1,
                    translate: '30%,0%',
                    scale: '1,2'
                },
                duration: 1000,
                finish: function() {
                }
            }]);

            setTimeout(function() {
                //anim.step(50);

                setTimeout(function() {
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
        onShow: function() {
            var that=this;



        },
        onDestory: function() {
        }
    });
});
