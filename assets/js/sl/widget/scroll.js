define(['$','./../base','./../view','./touch'],function(require,exports,module) {
    var $=require('$'),
        sl=require('./../base'),
        view=require('./../view'),
        Touch=require('./touch');

    var Scroll=Touch.extend({
        widgetName: 'Scroll',
        options: {
            bounce: true,
            hScroll: false
        },

        start: function() {
            var that=this;

            that.maxX=that.scrollerW-that.wrapperW;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;
            that.minX=0;

            return that.options.bounce?true:((that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH)==true);
        },

        onScroll: function(x,y) {
            var that=this;
            that.$el.trigger('scrollChange',[x,y]);
        }
    });

    return Scroll;
});
