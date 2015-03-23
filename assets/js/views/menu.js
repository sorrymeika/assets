define('views/menu',['zepto','sl/activity','bridge'],function(require,exports,module) {
    var $=require('zepto'),
        Activity=require('sl/activity'),
        bridge=require('bridge');

    module.exports=Activity.extend({
        template: 'views/menu.html',
        events: {
            'tap': function(e) {
                if($(e.target).hasClass('view')) {
                    this.back();
                }
            }
        },
        className: 'transparent',
        openEnterAnimationFrom: {
            translate: '-80%,0'
        },
        openEnterAnimationTo: {
            translate: '0,0'
        },
        openExitAnimationTo: {
            translate: '60%,0'
        },
        closeEnterAnimationTo: {
            translate: '0,0'
        },
        closeExitAnimationTo: {
            translate: '-80%,0'
        },
        onCreate: function() {
            var that=this;
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
