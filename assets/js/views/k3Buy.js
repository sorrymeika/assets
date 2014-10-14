define('views/k3Buy',['zepto','ui/sl','util','app','views/loading','views/buy'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Buy=require('views/buy');

    module.exports=Buy.extend({
        GameID: '32003',
        title: '快3选号',
        BetDataKey: 'k3BetData',
        backUrl: '/k3.html'
    });
});

