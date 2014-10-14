define('views/f15c5',['zepto','ui/sl','app','views/loading','views/selector','util'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');

    module.exports=Selector.extend({
        title: '15选5选号',
        GameID: '90015',
        BetDataKey: 'f15c5BetData',
        buyUrl: '/f15c5Buy.html',
        tabs: [{
            name: '普通投注',
            randomFlag: true,
            types: [{
                type: '00|01',
                condition: '$0==5',
                single: true,
                codes: '$codes0'
            },{
                type: '00|02',
                condition: '$0>=6',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '号码',
                msg: '请至少选择5个号码',
                randomFlag: true,
                randomNum: 5,
                range: [1,15]
            }]
        },{
            name: '胆拖投注',
            randomFlag: false,
            errors: [['$0>=5','胆码不能超过4个']],
            types: [{
                type: '00|03',
                condition: '$0>=1&&$0<=4&&($0+$1>=6)',
                codes: '$0$codes0$1$codes1'
            }],
            balls: [{
                color: 'red',
                title: '胆码',
                msg: '至少选择1个，最多选择4个',
                randomFlag: false,
                range: [1,15]
            },{
                color: 'red',
                title: '拖码',
                msg: '至少选择2个',
                randomFlag: false,
                range: [1,15]
            }]
        }]
    });
});