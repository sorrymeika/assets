define(['$','./../base','./../view','./../tween','./touch'],function(require,exports,module) {
    var $=require('$'),
        sl=require('./../base'),
        view=require('./../view'),
        tween=require('./../tween'),
        Touch=require('./touch'),
        hasTouch='ontouchstart' in window,
        m=Math,
        easeOut=tween.Quad.easeOut;

    var Scroll=Touch.extend({
        options: {
            bounce: true,
            hScroll: false
        },
        initialize: function() {
            this.start();
        },

        start: function() {
            var that=this;

            that._x=that.x=that.el.scrollLeft;
            that._y=that.y=that.el.scrollTop;

            that.startX=that.x;
            that.startY=that.y;

            that.wrapperW=that.el.clientWidth;
            that.wrapperH=that.el.clientHeight;

            that.scrollerW=that.el.scrollWidth;
            that.scrollerH=that.el.scrollHeight;

            that.maxX=that.scrollerW-that.wrapperW;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;
            that.minX=0;

            return that.options.bounce?true:((that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH)==true);
        },

        move: function(x,y) {
            var that=this;
            that.options.hScroll&&(that.el.scrollLeft=x);
            that.el.scrollTop=y;
            that.$el.trigger('scrollChange',[x,y]);
        }
    });

    return Scroll;
});
