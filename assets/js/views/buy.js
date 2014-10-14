define('views/buy',['zepto','ui/sl','util','app','views/loading','views/allTypes'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        types=require('views/allTypes'),
        Loading=require('views/loading');

    module.exports=sl.Activity.extend({
        template: 'views/buy.html',
        title: '双色球投注',
        GameID: '10001',
        BetDataKey: 'ssqBetData',
        maxTimes: 99,
        events: {
            'tap .J_Back': 'back',
            'tap .J_Delete': 'del',
            'tap .J_Clear': 'clear',
            'tap .J_Random': 'random',
            'tap .J_Buy': 'buy',
            'tap .J_Select': function () {
                this.to(this.backUrl)
            },
            'input .J_Times': function () {
                var $times=this.$('.J_Times'),
                    times=$times.val();

                if(times=='') return;

                if(!/^\d+$/.test(times)) {
                    $times.val(this.times);
                    return;
                }

                times=util.s2i(times);
                if(times==0) {
                    sl.tip('最小输入1');
                    $times.val(this.times);
                    return;
                } else if(times>this.maxTimes) {
                    sl.tip('最大输入'+this.maxTimes);
                    $times.val(this.times);
                    return;
                }

                this.times=times;
                this._setInfo();
            },
            'input .J_Number': function () {
                var $number=this.$('.J_Number'),
                    number=$number.val();

                if(number=='') return;

                if(!/^\d+$/.test(number)) {
                    $number.val(this.number);
                    return;
                }

                number=util.s2i(number);
                if(number==0) {
                    sl.tip('最小输入1');
                    $number.val(this.number);
                    return;
                } else if(number>365) {
                    sl.tip('最大输入365');
                    $number.val(this.number);
                    return;
                }

                this.number=number;
                this._setInfo();
            }
        },
        buy: function () {
            var that=this;

            if(that.$('.J_Number').val()==''||that.$('.J_Times').val()=='') {
                sl.tip('期数和倍数必须填写');
                return;
            }

            if(that.total<=0) {
                sl.tip('请至少选择一注');
                return;
            }

            if(!that.gameData) {
                sl.tip('网络错误');
                return;
            }

            sl.prompt('请输入您的投注密码',function (res) {
                if(typeof res==='undefined') return;

                var sl_prompt=this;

                res=$.trim(res);

                if(!res) {
                    sl.tip('请输入投注密码！');
                    return false;
                }

                if(!/^\d{6}$/.test(res)) {
                    sl.tip('您的投注密码输入有误，请重新输入！');
                    return false;
                }

                var betData=localStorage[that.BetDataKey].split('#'),
                    resultCode=[],
                    codes,
                    opt;

                $.each(betData,function (i,code) {
                    codes=code.split('|');

                    $.each(that.types,function (j,typeOpt) {
                        if(code.indexOf(typeOpt.type)==0) {
                            opt=typeOpt;
                            return false;
                        }
                    });

                    if($.isFunction(opt.getSubmitCodes)) {
                        codes[3]=opt.getSubmitCodes(codes[3]);
                    }

                    codes[2]=util.pad(that.times,4);
                    resultCode.push(codes.join('|'));
                });

                var data={
                    GameID: that.GameID,
                    WagerIssue: that.gameData.WagerIssue,
                    NumIssue: that.number,
                    RelationOrderID: '',
                    Sequence: '',
                    Amount: that.times*that.total*2*100,
                    DrawWay: 1,
                    BetData: resultCode.join('#'),
                    BetPassword: res,
                    BetCode: '',
                    VIP: ''
                }

                $('body').loading('load',{
                    url: '/api/CPService/Betting/?ct=json',
                    type: 'POST',
                    data: data,
                    success: function (res) {
                        sl_prompt.hide();

                        sl.tip('投注成功！');
                        that.clear();
                    },
                    error: function (res) {
                        if(res.ReturnCode=='90026') {
                            sl_prompt.hide();

                            data.OrderID=res.OrderID;

                            sl.prompt('请输入您的短信验证码',function (validCode) {
                                if(typeof validCode==='undefined') return;

                                validCode=$.trim(validCode);
                                if(!validCode) {
                                    sl.tip('请输入短信验证码！');
                                    return false;
                                }

                                var vc_prompt=this;

                                data.BetCode=validCode;

                                $('body').loading('load',{
                                    url: '/api/CPService/Betting/?ct=json',
                                    type: 'POST',
                                    data: data,
                                    success: function (res) {
                                        vc_prompt.hide();

                                        sl.tip('投注成功！');

                                        that.clear();
                                    },
                                    error: function (res) {
                                        if(res.ReturnCode=='90023') {
                                            sl.tip('您的短信验证码输入有误，请重新输入！');
                                        } else if(res.ReturnCode) {
                                            sl.tip('错误:'+res.ReturnCode);
                                        } else {
                                            sl.tip('网络错误');
                                        }
                                        this.hide();
                                    }
                                });

                                return false;
                            });

                        } else if(res.ReturnCode) {
                            sl.tip('错误:'+res.ReturnCode);
                        } else {
                            sl.tip('网络错误');
                        }

                        this.hide();
                    }
                });

                return false;

            },'password');

        },
        random: function () {
            this.$('.J_List').append('<li><span>1注 单式</span><i class="ssqNums">04&nbsp;&nbsp;12&nbsp;&nbsp;13&nbsp;&nbsp;14&nbsp;&nbsp;22&nbsp;&nbsp;27</i><span>16</span><em class="ico-delete J_Delete"></em></li>');
        },
        clear: function () {
            this.$('.J_List li').remove();
            this.total=0;
            localStorage.removeItem(this.BetDataKey);
            this._setInfo();

            this.to(this.backUrl);
        },
        _setInfo: function (total) {
            var that=this,
                $total=that.$('.J_Total'),
                $money=that.$('.J_Money'),
                text=$total.html().replace(/\d+注/,that.total+'注');

            text=text.replace(/^\d+倍/,that.times+'倍');
            text=text.replace(/\d+期/,that.number+'期');

            $total.html(text);
            $money.html('共'+that.times*that.total*2+'元');
        },
        del: function (e) {
            var that=this,
                $target=$(e.currentTarget),
                $parent=$target.parent(),
                data=localStorage[that.BetDataKey].split('#');

            data.splice($parent.index(),1);

            if(data.length==0) {
                that.clear();
            } else {
                localStorage[that.BetDataKey]=data.join('#');

                that.total-=util.s2i($parent.attr('data-num'));

                $parent.remove();
                that._setInfo();
            }
        },

        _loadData: function () {
            var that=this;

            that.$el.loading('load',{
                url: '/api/CPService/QueryGameXspar/?ct=json&gameid='+that.GameID+'&wagerissue=',
                success: function (res) {

                    that.gameData=res.Data[0];

                    that.$('.js_curPhase').html(res.Data[0].WagerIssue);

                    var dateArr=res.Data[0].DrawEndTime.replace(/T|\:/g,'-').split('-');
                    dateArr[1]=util.s2i(dateArr[1])-1;
                    var endTime=eval('new Date('+dateArr.join(',')+')'),
                        leftTime=(endTime-new Date())/1000;

                    if(leftTime<0) {
                        that.$('.js_leftTime').html("投注已结束");
                        that.isOver=true;

                    } else {
                        that.$('.js_leftTime').html("投注剩余"+that.parseTime(leftTime));
                        that.isOver=false;

                        that.interval=setInterval(function () {
                            leftTime--;

                            if(leftTime<=0) {
                                that.isOver=true;
                                that.$('.js_leftTime').html("投注已结束");
                                clearInterval(that.interval);
                                that.interval=null;
                            } else
                                that.$('.js_leftTime').html("投注剩余"+that.parseTime(leftTime));

                        },1000);
                    }
                }
            });
        },
        parseTime: function (s) {
            var h=Math.floor(s/(60*60));
            s=s-h*60*60;
            m=Math.floor(s/60);
            s=Math.floor(s-m*60);

            return h+"时"+m+"分"+s+"秒";
        },
        onCreate: function () {
            var that=this,
                data,
                total=0;

            that.types=types['t_'+that.GameID];

            that.$('.J_Header').html(that.title);

            if(!localStorage[that.BetDataKey]) {
                data=null;
            } else {
                var sBetData=localStorage[that.BetDataKey].split('#'),
                    betData,
                    data=[],
                    opt;

                $.each(sBetData,function (i,item) {
                    betData=item.split('|');

                    $.each(that.types,function (j,typeOpt) {
                        if(item.indexOf(typeOpt.type)==0) {
                            opt=typeOpt;
                            return false;
                        }
                    });

                    if(!opt) return;

                    if(opt.maxTimes) this.maxTimes=opt.maxTimes;

                    var itemData={
                        type: betData[1],
                        typeName: opt.name
                    },
                    replaceCode=function (codes,textArray) {
                        return codes.replace(/\d{2}/g,function (r) {
                            return textArray?'<em>'+textArray[r]+'</em>':'<em>'+r+"</em>";
                        }).replace(/&nbsp;&nbsp;$/,'')
                    };

                    var codes=betData[3],
                        pools=[];

                    if(opt.balls=='$') {
                        var num;
                        while(codes.length) {
                            num=util.s2i(codes.substr(0,2));
                            codes=codes.substr(2);
                            pools.push([num,codes.substr(0,2*num)]);
                            codes=codes.substr(2*num);
                        }

                    } else {
                        opt.balls.replace(/\$(\d+)/g,function (r0,r1) {
                            r1=util.s2i(r1);
                            pools.push([r1,codes.substr(0,2*r1)]);
                            codes=codes.substr(2*r1);
                            return '';
                        });
                    }

                    var t=opt.total.replace(/\$(\d+)/g,function (r0,r1) {
                        return pools[util.s2i(r1)][0];
                    }).replace(/\$/g,function (r0,r1) {
                        return 'util.';
                    });

                    itemData.num=eval(t);

                    itemData.red=opt.red.replace(/\$(\d+)/g,function (r0,r1) {
                        return replaceCode(pools[util.s2i(r1)][1],opt.textArray);
                    });

                    itemData.blue=opt.blue&&opt.blue.replace(/\$(\d+)/g,function (r0,r1) {
                        var code=pools[util.s2i(r1)][1];

                        return replaceCode(code,opt.blueTextArray);
                    });

                    total+=itemData.num;
                    data.push(itemData);
                });
            }

            that.total=total;
            that.times=1;
            that.number=1;

            that._setInfo();
            that.$('.J_Total').html(that.$('.J_Times').val()+'倍'+total+'注1期');
            that.$('.J_List').html(that.tmpl('list',{ data: data }));

        },
        onStart: function () {
        },
        onResume: function () {
        },
        onDestory: function () {
            $('body').loading('abort').loading('hide');
            this.interval&&clearInterval(this.interval);
        }
    });
});
