define('views/east61Buy',['zepto','ui/sl','util','app','views/loading','views/buy'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        util=require('util'),
        Loading=require('views/loading'),
        Buy=require('views/buy');


    module.exports=Buy.extend({
        GameID: '90016',
        title: '福彩6+1投注',
        BetDataKey: 'east61BetData',
        backUrl: '/east61.html'
    });
});
