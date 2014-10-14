define('views/selector',['zepto','ui/sl','app','views/loading','util','ui/dropdown'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Dropdown=require('ui/dropdown');

    module.exports=sl.Activity.extend({
        template: 'views/selector.html',
        title: '双色球选号',
        GameID: '10001',
        BetDataKey: 'ssqBetData',
        buyUrl: '/ssqBuy.html',
        tabs: [],
        events: {
            'tap .J_Back': 'back',
            'tap .js_red_ball_pool em': 'selectRed',
            'tap .js_blue_ball_pool em': 'selectBlue',
            'tap .J_Clear': 'clear',
            'tap .J_Buy': "buy",
            'tap .J_RandomOne': function (e) {
                var that=this;
                that._random($(e.currentTarget).closest('.js_ball_pool'));
            },
            'tap .J_Random': function (e) {
                this.motion();
            }
        },

        motion: function () {
            var that=this;

            that.currentType.randomFlag&&that.currentType.$el.find('.js_ball_pool[data-num]').each(function () {
                that._random($(this));
            });
        },

        _nextStep: function () {
            this.to(this.buyUrl);
        },
        buy: function () {
            var that=this,
                opt=that.currentType,
                $pools=$('.js_ball_pool',opt.$el),
                pools=[];

            if(that.isOver) {
                sl.tip("本期销售已截止！");
                return;
            }

            if(localStorage[that.BetDataKey]&&$pools.find('em.curr').length==0) {
                that._nextStep();
                return;
            }

            $.each(opt.balls,function (i) {
                var selected=$pools.eq(i).find('em.curr'),
                    betData=[];

                selected.each(function () {
                    betData.push(util.pad($(this).attr('data-code'),2));
                });

                pools.push([selected.length,betData.join('')]);
            });

            var flag=true,
                type,
                msg;

            if(opt.errors) {
                $.each(opt.errors,function (i,errorOpt) {
                    var condition=errorOpt[0].replace(/\$(\d+)/g,function (r0,r1) {
                        return pools[util.s2i(r1)][0];
                    });

                    if(eval(condition)) {
                        flag=false;
                        msg=errorOpt[1];
                        return false;
                    }
                });

                if(!flag) {
                    sl.tip(msg);
                    return;
                }
            }

            $.each(opt.types,function (i,typeOpt) {
                var condition=typeOpt.condition.replace(/\$(\d+)/g,function (r0,r1) {
                    return pools[util.s2i(r1)][0];
                });
                if(!eval(condition)) {
                    flag=false;
                } else {
                    type=typeOpt;
                    flag=true;
                    return false;
                }
            });

            if(!flag) {
                sl.tip("请至少选择一注");
                return;
            }

            var betCodes=type.codes.replace(/\$(\d+)/g,function (r0,r1) {
                return ','+util.pad(pools[util.s2i(r1)][0])+',';
            }).replace(/\$codes(\d+)/g,function (r0,r1) {
                return pools[util.s2i(r1)][1];
            }).replace(/\,/g,function () {
                return '';
            });

            if(type.sort) {
                var arr=[];
                betCodes.replace(/\d{2}/g,function (r1) {
                    arr.push(r1);
                });
                arr.sort();
                betCodes=arr.join('');
            }

            betCodes=type.type+'|0001|'+betCodes;

            if(type.single) {
                if(localStorage[that.BetDataKey]&&localStorage[that.BetDataKey].indexOf(type.type)!=0) {
                    sl.confirm('一笔订单只能包含一种模式注码，是否清除之前注码？',function () {
                        localStorage[that.BetDataKey]=betCodes;
                        that._nextStep();
                    });
                } else {
                    if(localStorage[that.BetDataKey]) {

                        if(localStorage[that.BetDataKey].split('#').length>=5) {
                            sl.tip("一个订单单式最多只能5注！");
                            return;
                        }

                        localStorage[that.BetDataKey]+='#'+betCodes;
                    } else
                        localStorage[that.BetDataKey]=betCodes;

                    that._nextStep();
                }

            } else {
                if(localStorage[that.BetDataKey]&&localStorage[that.BetDataKey].indexOf(type.type)!=0) {
                    sl.confirm('一笔订单只能包含一种模式注码，是否清除之前注码？',function () {
                        localStorage[that.BetDataKey]=betCodes;
                        that._nextStep();
                    });
                } else {
                    localStorage[that.BetDataKey]=betCodes;
                    that._nextStep();
                }
            }

        },
        _random: function ($container) {
            var $balls=$container.find('.bd em'),
                target=$container[0],
                i=util.s2i($container.attr('data-num')),
                max=$balls.length-1;

            $balls.removeClass('curr');

            if(target._random_timer) {
                clearInterval(target._random_timer);
            }

            target._random_timer=setInterval(function () {

                var num=Math.round(Math.random()*max);

                if(!$balls.eq(num).hasClass('curr')) {
                    $balls.eq(num).addClass('curr');
                    i--;
                }

                if(i<=0) {
                    clearInterval(target._random_timer);
                    target._random_timer=null;
                }

            },100);
        },
        onCreate: function () {
            var that=this,
                tabs=[];

            that.$('.J_Header').html(that.title);

            $.each(that.tabs,function (i,tab) {
                tabs.push({
                    text: tab.name
                });

                html='<div class="js_type_cont'+(!tab.repeat?' js_no_repeat':'')+'" style="display:'+(i==0?'block':'none')+'">';

                $.each(tab.balls,function (i,ballOpt) {

                    html+='<div class="'+ballOpt.color+' ballPool js_ball_pool"'+(ballOpt.randomFlag?' data-num="'+ballOpt.randomNum+'"':'')+'>\
                        <div class="hd">'+(ballOpt.randomFlag?'<span class="J_RandomOne">随机</span>':'')+' <em class="J_MsgTitle">'+ballOpt.title+'</em>\
                            <i class="J_Msg">'+ballOpt.msg+'</i> </div>\
                        <div class="bd">\
                            <ul class="table redBallList js_'+ballOpt.color+'_ball_pool'+(ballOpt.single?' js_single':'')+'"><li>';

                    var count=1;
                    for(var i=ballOpt.range[0],n=ballOpt.range[1];i<=n;i++) {
                        html+='<p><em'+(ballOpt.className?' class="'+ballOpt.className+'"':'')+' data-'+ballOpt.color+'="'+i+'" data-code="'+(ballOpt.codes?ballOpt.codes[count-1]:i)+'">'+(ballOpt.textArray?ballOpt.textArray[count-1]:i)+'</em></p>';
                        if(count%8==0) { html+="</li><li>"; }

                        count++
                    }

                    html+='</ul>\
                        </div>\
                    </div>';
                });

                html+='</div>';

                var $cont=$(html).appendTo(that.$('#main'));

                that.tabs[i].$el=$cont;
            });

            that.currentType=that.tabs[0];
            that.$('.J_Random')[that.currentType.randomFlag?'show':'hide']();

            if(that.tabs.length>=2) {
                that.$('.J_Type').dropdown({
                    data: tabs,
                    onChange: function (e,index) {

                        that.currentType=that.tabs[index];
                        that.currentType.$el.show().siblings('.js_type_cont').hide();
                        that.$('.J_Header').html(that.title+'-'+that.currentType.name);

                        that.$('.J_Random')[that.currentType.randomFlag?'show':'hide']();
                    }
                });
            } else
                that.$('.J_Type').hide();

            $(window).on('motion',$.proxy(that.motion,that));
        },

        _loadData: function () {
            var that=this;

            $('body').loading('load',{
                url: '/api/CPService/QueryGameXspar/?ct=json&gameid='+that.GameID+'&wagerissue=',
                success: function (res) {

                    that.$('.js_curPhase').html(res.Data[0].WagerIssue);

                    console.log('new Date('+res.Data[0].DrawEndTime.replace(/T|\:/g,'-').split('-').join(',')+')')

                    var dateArr=res.Data[0].DrawEndTime.replace(/T|\:/g,'-').split('-');
                    dateArr[1]=util.s2i(dateArr[1])-1;
                    var endTime=eval('new Date('+dateArr.join(',')+')'),
                        leftTime=(endTime-new Date())/1000;

                    if(leftTime<0) {
                        that.$('.js_leftTime').html("销售已截止！");
                        that.isOver=true;

                    } else {
                        that.$('.js_leftTime').html("投注剩余"+that.parseTime(leftTime));

                        that.interval=setInterval(function () {
                            leftTime--;
                            if(leftTime<=0) {
                                that.isOver=true;
                                that.$('.js_leftTime').html("销售已截止！");
                                clearInterval(that.interval);
                                that.interval=null;
                            } else
                                that.$('.js_leftTime').html("投注剩余"+that.parseTime(leftTime));

                        },1000);
                    }
                },
                error: function (xhr) {
                    if(xhr.status==500||xhr.status==401) {
                        localStorage.authCookies='';
                        localStorage.auth='';
                        localStorage.UserName='';

                        this.hide();
                        sl.confirm({
                            title: '登录',
                            content: '您还未登录,是否登录',
                            okText: '立即登录'

                        },function () {
                            app.exec('login',function(res) {
                                localStorage.auth=JSON.stringify(res);
                                localStorage.UserName=res.UserName;
                                localStorage.authCookies=".ASPXCOOKIEWebApi="+res[".ASPXCOOKIEWebApi"]+"; ASP.NET_SessionId="+res["ASP.NET_SessionId"];

                                that._loadData();
                            });
                        },function () {
                            that.to('/');
                        });
                    } else {
                        var ld=this;
                        this.msg('网络错误');
                        this.$loading.one('tap',function () {
                            that.to('/');
                            ld.hide();
                        });
                    }
                }
            });
        },
        clear: function () {
            this.$('.js_ball_pool .bd em.curr').removeClass('curr');
        },
        selectRed: function (e) {
            var $target=$(e.currentTarget);
            if(!$target.hasClass('curr')) {
                this.$('.js_no_repeat [data-red="'+$target.attr('data-red')+'"].curr').removeClass('curr');
            }
            $target.toggleClass('curr');

            var opt=this.currentType,
                $pools=$('.js_ball_pool',opt.$el),
                pools=[];

            $.each(opt.balls,function (i) {
                var selected=$pools.eq(i).find('em.curr'),
                    betData='';

                selected.each(function () {
                    betData+=util.pad($(this).attr('data-code'),2);
                });

                pools.push([selected.length,betData]);
            });

            var flag=true,
                type,
                msg;

            if(opt.errors) {
                $.each(opt.errors,function (i,errorOpt) {
                    var condition=errorOpt[0].replace(/\$(\d+)/g,function (r0,r1) {
                        return pools[util.s2i(r1)][0];
                    });

                    if(eval(condition)) {
                        flag=false;
                        msg=errorOpt[1];
                        return false;
                    }
                });

                if(!flag) {
                    sl.tip(msg);
                    $target.toggleClass('curr');
                    return;
                }
            }

            if($target.closest('.redBallList').hasClass('js_single')) {
                $target.closest('p').siblings('p').find('em.curr').removeClass('curr');
            }
        },
        selectBlue: function (e) {
            $(e.currentTarget).toggleClass('curr');
        },
        parseTime: function (s) {

            var h=Math.floor(s/(60*60));
            s=s-h*60*60;
            m=Math.floor(s/60);
            s=Math.floor(s-m*60);

            return h+"时"+m+"分"+s+"秒";
        },
        onStart: function () {
        },
        onResume: function () {
            this.clear();
            $(window).on('motion',$.proxy(this.motion,this));
        },
        onDestory: function () {
            $('body').loading('abort').loading('hide');
            this.interval&&clearInterval(this.interval);
            $(window).off('motion',this.motion);
        },
        onPause: function () {
            $(window).off('motion',this.motion);
        }
    });
});
