define('views/3dBuy',['zepto','ui/sl','util','app','views/loading','views/buy'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Buy=require('views/buy');

    module.exports=Buy.extend({
        GameID: '10002',
        title: '3D投注',
        BetDataKey: 'threedDBetData',
        backUrl: '/3d.html'
    });
});

