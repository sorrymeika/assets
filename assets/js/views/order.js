define('views/order',['zepto','util','ui/sl','ui/tabs','app','views/loading','views/allTypes'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        types=require('views/allTypes'),
        common=sl.common;

    module.exports=sl.Activity.extend({
        template: 'views/order.html',
        events: {
            'tap .J_Back': 'back'
        },
        onCreate: function() {
            var that=this,
                orderInfo=common.orderInfo||JSON.parse(localStorage.tmpOrderData),
                data=[],
                betData,
                opt,
                typeOpts=types['t_'+orderInfo.GameID];

            localStorage.tmpOrderData=JSON.stringify(orderInfo);

            $.each(orderInfo.BetData.split('#'),function(i,item) {
                betData=item.split('|');

                $.each(typeOpts,function(j,typeOpt) {
                    if(item.indexOf(typeOpt.type)==0) {
                        opt=typeOpt;
                        return false;
                    }
                });

                if(!opt) {
                    data.push({
                        typeName: '接口数据有误，不存在游戏代码'+item
                    })
                    return;
                }

                var itemData={
                    type: betData[1],
                    times: util.s2i(betData[2]),
                    typeName: opt.name
                },
                replaceCode=function(codes,textArray) {
                    return codes.replace(/\d{2}/g,function(r) {
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
                    opt.balls.replace(/\$(\d+)/g,function(r0,r1) {
                        r1=util.s2i(r1);
                        pools.push([r1,codes.substr(0,2*r1)]);
                        codes=codes.substr(2*r1);
                        return '';
                    });
                }

                var t=opt.total.replace(/\$(\d+)/g,function(r0,r1) {
                    try {
                        return pools[util.s2i(r1)][0];
                    } catch(e) {
                        return '';
                    }
                }).replace(/\$/g,function(r0,r1) {
                    return 'util.';
                });

                itemData.num=eval(t);

                itemData.red=opt.red.replace(/\$(\d+)/g,function(r0,r1) {
                    try {
                        return replaceCode(pools[util.s2i(r1)][1]);
                    } catch(e) {
                        return '';
                    }
                });

                itemData.blue=opt.blue&&opt.blue.replace(/\$(\d+)/g,function(r0,r1) {
                    var code=pools[util.s2i(r1)][1];

                    return replaceCode(code,opt.blueTextArray);
                });

                //total+=itemData.num;

                data.push(itemData);
            });

            orderInfo.codes=data;

            that.$('#main').html(that.tmpl('order',orderInfo));

            that.$el.loading('load',{
                url: '/api/CPService/QueryLotteryAnnouncement/?ct=json&gameid='+orderInfo.GameID+'&wagerissue='+orderInfo.WagerIssue+'&qsnum=1',
                success: function(res) {
                    console.log(res);
                },
                error: function() {
                    this.hide();
                }
            });

        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
