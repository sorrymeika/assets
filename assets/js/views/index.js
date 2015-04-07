define(['$','util','bridge','sl/activity','sl/widget/loading','sl/widget/slider','tween','sl/vdom','sl/images'],function (require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        bridge=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    var VirtualDom=require('sl/vdom');
    var ImageCanvas=require('sl/images');

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
            return;

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

            that.$el.on('touchstart',function (e) {
                var that=this,
                    point=e.touches[0];

                that.pointX=that.startX=point.pageX;
                that.pointY=that.startY=point.pageY;

                that.isTouchStop=false;
                that.isTouchStart=false;
                that.isTouchMoved=false;

                that.startTime=e.timeStamp||Date.now();

                that.startScrollTop=imageItem.scrollTop;

                that.trigger('start');

            }).on('touchmove',function (e) {
                if(this.isTouchStop) return;

                var that=this,
                    minDelta=8,
                    point=e.touches[0],
                    deltaX=point.pageX-that.startX,
                    deltaY=point.pageY-that.startY;

                if(!that.isTouchStart) {
                    var isDirectionX=Math.abs(deltaX)>=minDelta,
                        isDirectionY=Math.abs(deltaY)>=minDelta;

                    if(isDirectionY) {
                        that.isTouchStart=true;
                        that.isDirectionY=true;

                    } else if(isDirectionX) {
                        that.isTouchStart=true;
                        that.isDirectionY=false;

                    } else {
                        return;
                    }
                }

                that.trigger('move');


                if(that.isDirectionY) {
                    imageItem.scrollTop=that.startScrollTop-deltaY;

                    imageCanvas.draw();
                }

                that.isTouchMoved=true;

                that.pointX=point.pageX;
                that.pointY=point.pageY;

                return false;
            })
            .on('touchend',function (e) {
                var that=this;

                if(!that.isTouchMoved) return;
                that.isTouchMoved=false;

                if(that.isTouchStop) return;
                that.isTouchStop=true;

                $(e.target).trigger('touchcancel');

                var point=e.changedTouches[0],
                    target,
                    duration=(e.timeStamp||Date.now())-that.startTime;

                if(duration<300) {
                    that.momentum=tween.momentum([[that.startScrollTop,imageItem.scrollTop,duration,nodeList.scrollHeight,0,window.innerHeight],[that.startNScrollTop,nodeList.scrollTop,duration,nodeList.scrollHeight,0,window.innerHeight]],function (img,ym) {

                        imageItem.scrollTop=img.current;
                        nodeList.scrollTop=ym.current;
                        vdom.draw();
                        //imageCanvas.draw();

                    },'ease',function () {
                        that.momentum=null;
                    });
                } else {
                    if(that.momentum) {
                        that.momentum.finish();
                    }
                }

                return false;
            });

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
