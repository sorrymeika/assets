define('views/east61',['zepto','ui/sl','app','views/loading','views/selector','util'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');

    module.exports=Selector.extend({
        title: '福彩6+1选号',
        GameID: '90016',
        BetDataKey: 'east61BetData',
        buyUrl: '/east61Buy.html',
        tabs: [{
            name: '普通投注',
            randomFlag: true,
            repeat: true,
            types: [{
                type: '00|01',
                condition: '$0==1&&$1==1&&$2==1&&$3==1&&$4==1&&$5==1&&$6==1',
                codes: '$codes0$codes1$codes2$codes3$codes4$codes5$codes6',
                single: true
            },{
                type: '00|02',
                condition: '($0>1||$1>1||$2>1||$3>1||$4>1||$5>1||$6>1)&&($0>0&&$1>0&&$2>0&&$3>0&&$4>0&&$5>0&&$6>0)',
                codes: '$0$codes0$1$codes1$2$codes2$3$codes3$4$codes4$5$codes5$6$codes6'
            }],
            balls: [{
                color: 'red',
                title: '第一位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '第二位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '第三位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '第四位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '第五位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '第六位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'blue',
                title: '生肖',
                msg: '请至少选择1个生肖',
                randomFlag: true,
                randomNum: 1,
                range: [1,12],
                textArray: '鼠 牛 虎 兔 龙 蛇 马 羊 猴 鸡 狗 猪'.split(' ')
            }]
        }]
    });
});
