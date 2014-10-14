define('views/ssq',['zepto','ui/sl','app','views/loading','views/selector','util'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');
        
    module.exports=Selector.extend({
        title: '双色球选号',
        GameID: '10001',
        BetDataKey: 'ssqBetData',
        buyUrl: '/ssqBuy.html',
        tabs: [{
            name: '普通投注',
            randomFlag: true,
            types: [{
                type: '00|01',
                condition: '$0==6&&$1==1',
                single: true,
                codes: '$codes0$codes1'
            },{
                type: '00|02',
                condition: '($0>=7&&$1>=1)||($1>=2&&$0>=6)',
                codes: '$0$codes0$1$codes1'
            }],
            balls: [{
                color: 'red',
                title: '红球',
                msg: '至少选择6个红球',
                randomFlag: true,
                randomNum: 6,
                range: [1,33]
            },{
                color: 'blue',
                title: '蓝球',
                msg: '请至少选择1个蓝球',
                randomFlag: true,
                randomNum: 1,
                range: [1,16]
            }]
        },{
            name: '胆拖投注',
            randomFlag: false,
            errors: [['$0>5','胆码不能超过5个']],
            types: [{
                type: '00|03',
                condition: '$0>=1&&$0<=5&&($0+$1>=7)&&$2>=1',
                codes: '$0$codes0$1$codes1$2$codes2'
            }],
            balls: [{
                color: 'red',
                title: '胆码-红球',
                msg: '至少选择1个，最多选择5个',
                randomFlag: false,
                range: [1,33]
            },{
                color: 'red',
                title: '拖码-红球',
                msg: '至少选择2个红球',
                randomFlag: false,
                range: [1,33]
            },{
                color: 'blue',
                title: '蓝球',
                msg: '请至少选择1个蓝球',
                randomFlag: false,
                range: [1,16]
            }]
        }]
    });
});
