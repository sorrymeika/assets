define('views/qlc',['zepto','ui/sl','app','views/loading','views/selector','util'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');

    module.exports=Selector.extend({
        title: '七乐彩选号',
        GameID: '10003',
        BetDataKey: 'qlcBetData',
        buyUrl: '/qlcBuy.html',
        tabs: [{
            name: '普通投注',
            randomFlag: true,
            types: [{
                type: '00|01',
                condition: '$0==7',
                single: true,
                codes: '$codes0'
            },{
                type: '00|02',
                condition: '$0>=8',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '号码',
                msg: '请至少选择7个号码',
                randomFlag: true,
                randomNum: 7,
                range: [1,30]
            }]
        },{
            name: '胆拖投注',
            randomFlag: false,
            errors: [['$0>=7','胆码不能超过6个']],
            types: [{
                type: '00|03',
                condition: '$0>=1&&$0<=6&&($0+$1>=8)',
                codes: '$0$codes0$1$codes1'
            }],
            balls: [{
                color: 'red',
                title: '胆码',
                msg: '至少选择1个，最多选择6个',
                randomFlag: false,
                range: [1,30]
            },{
                color: 'red',
                title: '拖码',
                msg: '至少选择2个',
                randomFlag: false,
                range: [1,30]
            }]
        }]
    });
});