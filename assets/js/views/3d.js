define('views/3d',['zepto','ui/sl','app','views/loading','views/selector','util'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Selector=require('views/selector');

    module.exports=Selector.extend({
        title: '3D选号',
        GameID: '10002',
        BetDataKey: 'threedDBetData',
        buyUrl: '/3dBuy.html',
        tabs: [{
            name: '直选',
            randomFlag: true,
            repeat: true,
            types: [{
                type: '01|01',
                condition: '$0==1&&$1==1&&$2==1',
                single: true,
                codes: '$codes0$codes1$codes2'
            },{
                type: '01|02',
                condition: '$0>1||$1>1||$2>1',
                codes: '$0$codes0$1$codes1$2$codes2'
            }],
            balls: [{
                color: 'red',
                title: '百位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '十位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            },{
                color: 'red',
                title: '个位',
                msg: '至少选择1个',
                randomFlag: true,
                randomNum: 1,
                range: [0,9]
            }]
        },{
            name: '组三单式',
            randomFlag: false,
            types: [{
                type: '02|01',
                condition: '$0==1&&$1==1',
                sort: true,
                codes: '$codes0$codes1$codes0'
            }],
            balls: [{
                color: 'red',
                title: '重号',
                msg: '请选择1个号码',
                randomFlag: false,
                single: true,
                range: [0,9]
            },{
                color: 'red',
                title: '单号',
                msg: '请选择1个号码',
                single: true,
                randomFlag: false,
                range: [0,9]
            }]
        },{
            name: '组三复式',
            randomFlag: false,
            types: [{
                type: '02|06',
                condition: '$0>=2',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '选号',
                msg: '至少选择2个',
                randomFlag: false,
                range: [0,9]
            }]
        },{
            name: '组六选号',
            randomFlag: false,
            types: [{
                type: '03|06',
                condition: '$0>=3',
                codes: '$0$codes0'
            }],
            balls: [{
                color: 'red',
                title: '选号',
                msg: '至少选择3个',
                randomFlag: false,
                range: [0,9]
            }]
        }]
    });
});