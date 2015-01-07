define(['$','sl/activity','bridge'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        bridge=require('bridge'),
        util=require('util');

    module.exports=Activity.extend({
        template: 'views/eco.html',
        events: {},
        onCreate: function() {
            var that=this;

            var data=[{
                title: '面料可与皮肤直接接触',
                content: '我们是一群T恤创意帮，我们热爱潮流更热衷创意。速纺认为，T恤不仅仅是印制这字或画的布料，而是张扬自我的画布。我们相信每个人都可以并且都应该成为自己的设计师。速纺给予这些设计师一个展示独特自我的平台。'
            }]

        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });

});