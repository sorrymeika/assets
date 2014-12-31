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
        },

        start: function() {
            var that=this;

            that.x=that.el.scrollLeft;
            that.y=that.el.scrollTop;

            that.startX=that.x;
            that.startY=that.y;

            that.wrapperW=that.el.clientWidth;
            that.wrapperH=that.el.clientHeight;

            that.scrollerW=that.el.scrollWidth;
            that.scrollerH=that.el.scrollHeight;

            that.maxX=that.scrollerW-that.wrapperW;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;

            return that.options.bounce?true:((that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH)==true);
        },

        bounce: function(bounceX,bounceY) {
            this.$el.css({ '-webkit-transform': 'translate('+bounceX+'px,'+(bounceY)+'px) translateZ(0)' });
        },

        bounceBack: function() {
            var that=this;
            that.$el.animate({ '-webkit-transform': 'translate(0px,0px) translateZ(0)' },200,'ease-out',function() {
                that.$el.css({ '-webkit-transform': '' });
            });
            that.y=that.el.scrollTop;
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
