define('views/qlcBuy',['zepto','ui/sl','util','app','views/loading','views/buy'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Buy=require('views/buy');

    module.exports=Buy.extend({
        GameID: '10003',
        title: '七乐彩投注',
        BetDataKey: 'qlcBetData',
        backUrl: '/qlc.html'
    });
});

