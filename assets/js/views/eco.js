define(['$','sl/activity','bridge','sl/widget/slider'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        bridge=require('bridge'),
        util=require('util');

    var Slider=require('sl/widget/slider');

    module.exports=Activity.extend({
        template: 'views/eco.html',
        events: {},
        onCreate: function() {
            var that=this;

            var data=[{
                src: 'images/eco0.png',
                title: '面料可与皮肤直接接触',
                content: '我们是一群T恤创意帮，我们热爱潮流更热衷创意。速纺认为，T恤不仅仅是印制这字或画的布料，而是张扬自我的画布。我们相信每个人都可以并且都应该成为自己的设计师。速纺给予这些设计师一个展示独特自我的平台。'
            },{
                src: 'images/eco1.png',
                title: '面料可与皮肤直接接触',
                content: '我们是一群T恤创意帮，我们热爱潮流更热衷创意。速纺认为，T恤不仅仅是印制这字或画的布料，而是张扬自我的画布。我们相信每个人都可以并且都应该成为自己的设计师。速纺给予这些设计师一个展示独特自我的平台。'
            },{
                src: 'images/eco2.png',
                title: '面料可与皮肤直接接触',
                content: '我们是一群T恤创意帮，我们热爱潮流更热衷创意。速纺认为，T恤不仅仅是印制这字或画的布料，而是张扬自我的画布。我们相信每个人都可以并且都应该成为自己的设计师。速纺给予这些设计师一个展示独特自我的平台。'
            }]

            that.slider=new Slider(that.$('.js_list'),{
                data: data,
                itemTemplate: '<div style="position:relative"><img class="img" src="${src}" onerror="this.removeAttribute(\'src\')" /><div class="ecohd">${title}</div><div class="ecobd">${content}</div></div>'
            });
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });

});