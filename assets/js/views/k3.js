define('views/k3',['zepto','ui/sl','app','views/loading','views/selector','util'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');

    module.exports=Selector.extend({
        title: '快3选号',
        GameID: '32003',
        BetDataKey: 'k3BetData',
        buyUrl: '/k3Buy.html',
        tabs: [{
            name: '和值',
            randomFlag: true,
            types: [{
                type: '01|01',
                condition: '$0==1',
                single: false,
                codes: '$codes0'
            },{
                type: '01|02',
                condition: '$0>1',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '和值',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [4,17]
            }]
        },{
            name: '三同号单选',
            randomFlag: true,
            types: [{
                type: '03|01',
                condition: '$0==1',
                codes: '$codes0'
            }],
            balls: [{
                color: 'red',
                title: '选号',
                msg: '选择1个',
                randomFlag: true,
                single: true,
                randomNum: 1,
                range: [1,6],
                textArray: ['111','222','333','444','555','666']
            }]
        },{
            name: '三同号通选',
            randomFlag: false,
            types: [{
                type: '02|01',
                condition: '$0==1',
                codes: ''
            }],
            balls: [{
                color: 'red',
                className: 'long_text',
                title: '选号',
                msg: '选择1个',
                randomFlag: false,
                randomNum: 1,
                range: [0,0],
                codes: [''],
                textArray: ['三同号通选']
            }]
        },{
            name: '二同号单选',
            randomFlag: true,
            types: [{
                type: '05|01',
                condition: '$0==1&&$1==1',
                codes: '$codes0$codes0$codes1'
            }],
            balls: [{
                color: 'red',
                title: '同号',
                msg: '选择1个',
                randomFlag: true,
                single: true,
                randomNum: 1,
                range: [1,6],
                textArray: ['11','22','33','44','55','66']
            },{
                color: 'red',
                title: '不同号',
                msg: '选择1个',
                single: true,
                randomFlag: true,
                randomNum: 1,
                range: [1,6]
            }]
        },{
            name: '二同号复选',
            randomFlag: false,
            types: [{
                type: '04|02',
                condition: '$0>=1',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '同号',
                msg: '至少选择1个',
                randomFlag: false,
                single: false,
                randomNum: 1,
                range: [1,6],
                textArray: ['11*','22*','33*','44*','55*','66*']
            }]
        },{
            name: '三不同号',
            randomFlag: true,
            types: [{
                type: '06|01',
                condition: '$0==3',
                codes: '$codes0'
            },{
                type: '06|02',
                condition: '$0>=4',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '选号',
                msg: '至少选择3个',
                randomFlag: true,
                randomNum: 3,
                range: [1,6]
            }]
        },{
            name: '二不同号',
            randomFlag: true,
            types: [{
                type: '07|02',
                condition: '$0==2',
                codes: '$0$codes0'
            },{
                type: '07|02',
                condition: '$0>=3',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '选号',
                msg: '至少选择2个',
                randomFlag: true,
                randomNum: 3,
                range: [1,6]
            }]
        },{
            name: '三连号通选',
            randomFlag: false,
            types: [{
                type: '08|01',
                condition: '$0==1',
                codes: ''
            }],
            balls: [{
                color: 'red',
                className: 'long_text',
                title: '选号',
                msg: '选择1个',
                randomFlag: false,
                randomNum: 1,
                range: [0,0],
                codes: [''],
                textArray: ['三同号通选']
            }]
        }]
    });
});