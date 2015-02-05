﻿define(['$','./../base','./../view','./../tween'],function(require,exports,module) {
    var $=require('$'),
        view=require('./../view'),
        tween=require('./../tween'),
        hasTouch='ontouchstart' in window,
        m=Math,
        easeOut=tween.easeOut;

    //dist:单位时间内滚动的距离
    //time:单位时间
    //maxDistUpper: 最大向上滚动距离
    //maxDistLower: 最大向下滚动距离
    //size:反弹距离
    var _momentum=function(dist,time,maxDistUpper,maxDistLower,size) {
        var deceleration=0.0006,
                speed=m.abs(dist)/time,
                newDist=(speed*speed)/(2*deceleration),
                newTime=0,outsideDist=0;

        if(dist>0&&newDist>maxDistUpper) {
            outsideDist=size/(6/(newDist/speed*deceleration))/2;
            maxDistUpper=maxDistUpper+outsideDist;
            speed=speed*maxDistUpper/newDist;
            newDist=maxDistUpper;
        } else if(dist<0&&newDist>maxDistLower) {
            outsideDist=size/(6/(newDist/speed*deceleration))/2;
            maxDistLower=maxDistLower+outsideDist;
            speed=speed*maxDistLower/newDist;
            newDist=maxDistLower;
        }

        newDist=newDist*(dist<0?-1:1);
        newTime=speed/deceleration;

        return { dist: newDist,time: m.round(newTime) };
    };


    var Scroll=view.extend({
        events: {
            'touchstart': '_start',
            'touchmove': '_move',
            'touchend': '_end'
        },

        options: {
            bounce: true,
            hScroll: false,
            vScroll: true
        },
        initialize: function() {
        },
        x: 0,
        y: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        minDelta: 6,
        start: function() {
            var that=this;

            that.maxX=that.scrollerW-that.wrapperW;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;
            that.minX=0;

            return that.options.bounce?true:((that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH)==true);
        },
        _aniTimer: 0,

        stopAnimate: function() {
            var ani=this._aniTimer;
            if(ani) {
                ani.stop();
                this._aniTimer=0;
                this._isAniStop=true;
                return true;
            }
            else return false;
        },

        animate: function(x,y,duration,callback) {
            var that=this,
                fromX=that.x,
                fromY=that.y;

            if($.isPlainObject(duration))
                callback=duration;

            if($.isPlainObject(callback))
                duration=callback.duration,callback=callback.callback;

            !duration&&(duration=200);

            tween.animate(function(d) {
                var cx=fromX+(x-fromX)*d,
                    cy=fromY+(y-fromY)*d;

                that.pos(m.round(cx),m.round(cy));
                that._aniTimer=this;

            },duration,'ease-out',function() {
                that._aniTimer=null;
                that._isAniStop=true;
                callback&&callback.call(that,x,y);
            });
        },

        bounceBack: function() {
            var that=this;
            var newX=that.x<that.minX?that.minX:that.x>that.maxX?that.maxX:that.x;
            var newY=that.y<that.minY?that.minY:that.y>that.maxY?that.maxY:that.y;
            that._bounceChanged=false;

            if(newX!=that.x||newY!=that.y) {
                that.animate(newX,newY,200,that.onScrollStop);

            } else {
                that.onScrollStop();
            }
        },

        end: function() {
            this.options.bounce?this.bounceBack():this.onScrollStop();
        },

        onScroll: function(x,y) {
            this.$el.trigger('scrollChange',[x,y]);
        },

        onScrollStop: function() {
        },

        _start: function(e) {
            var that=this,
                point=hasTouch?e.touches[0]:e;

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            that.startTime=e.timeStamp||Date.now();

            that._isStop=false;
            that._isStart=false;
            that._moved=false;
            return !that.stopAnimate();
        },

        _refersh: function() {
            var that=this;
            that.x=that.el.scrollLeft;
            that.y=that.el.scrollTop;

            that.startX=that.x;
            that.startY=that.y;

            that.wrapperW=that.el.clientWidth;
            that.wrapperH=that.el.clientHeight;

            that.scrollerW=that.el.scrollWidth;
            that.scrollerH=that.el.scrollHeight;
        },

        _move: function(e) {
            var point=hasTouch?e.touches[0]:e;

            if(this._isStop) return;

            if(e.isDefaultPrevented()) {
                this._isStop=true;
                return;
            }

            var that=this;
            var point=hasTouch?e.touches[0]:e;
            var deltaX=that.pointX-point.pageX;
            var deltaY=that.pointY-point.pageY;

            if(!that._isStart) {
                var isV=m.abs(deltaY)>=that.minDelta;
                var isH=m.abs(deltaX)>=that.minDelta;
                if(isH||isV) {
                    that._refersh();
                    that._isStart=(isV&&that.options.vScroll||isH&&that.options.hScroll)&&(that.start()!==false);
                    if(that._isStop=!that._isStart) return;

                } else
                    return;
            }

            var newX=that.x+deltaX,
                newY=that.y+deltaY,
                timestamp=e.timeStamp||Date.now();

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            if(newX<that.minX||newX>that.maxX) {
                newX=that.options.bounce?that.x+(deltaX/4):newX<=that.minX?that.minX:that.maxX;
            }

            if(newY<that.minY||newY>that.maxY) {
                newY=that.options.bounce?that.y+(deltaY/4):newY<=that.minY?that.minY:that.maxY;
            }

            that._moved=true;

            that.pos(newX,newY);

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=that.x;
                that.startY=that.y;
            }
            return false;
        },

        _end: function(e) {
            var that=this;
            if((!that._moved||that._isStop)&&that._isAniStop) {
                that.end();
                that._isAniStop=false;
            }

            if(that._isStop) return;
            that._isStop=true;

            if(!that._moved||hasTouch&&e.touches.length!==0) return;

            $(e.target).trigger('touchcancel');

            var point=hasTouch?e.changedTouches[0]:e,
                target,ev,
                momentumX={ dist: 0,time: 0 },
                momentumY={ dist: 0,time: 0 },
                duration=(e.timeStamp||Date.now())-that.startTime,
                newPosX=that.x,
                newPosY=that.y,
                newDuration;

            e.preventDefault();

            if(duration<300) {
                momentumX=newPosX?_momentum(newPosX-that.startX,duration,that.maxX-that.x,that.x-that.minX,that.options.bounce?(that.wrapperW||window.innerWidth):0):momentumX;
                momentumY=newPosY?_momentum(newPosY-that.startY,duration,that.maxY-that.y,that.y-that.minY,that.options.bounce?(that.wrapperH||window.innerHeight):0):momentumY;

                newPosX=that.x+momentumX.dist;
                newPosY=that.y+momentumY.dist;

                if(!that.options.hScroll||(that.x<that.minX&&newPosX<that.minX)||(that.x>that.maxX&&newPosX>that.maxX))
                    momentumX={ dist: 0,time: 0 },newPosX=that.x;

                if(!that.options.vScroll||(that.y<that.minY&&newPosY<that.minY)||(that.y>that.maxY&&newPosY>that.maxY))
                    momentumY={ dist: 0,time: 0 },newPosY=that.y;
            }

            if(momentumX.dist||momentumY.dist) {
                newDuration=m.max(m.max(momentumX.time,momentumY.time),10);

                that._startMomentumAni(m.round(newPosX),m.round(newPosY),newDuration);
            } else {
                that.end();
            }
        },

        _startMomentumAni: function(x,y,duration) {
            this.animate(x,y,duration,this.end);
        },

        pos: function(x,y) {
            this._pos(x,y);
        },

        _pos: function(x,y) {
            var that=this;

            if(that.x==x&&that.y==y) return;

            var maxX=that.scrollerW-that.wrapperW;
            var maxY=that.scrollerH-that.wrapperH;
            var bounceX=0;
            var bounceY=0;

            if(that.options.hScroll) {
                that.x=x;

                if(x>=0&&x<=maxX) {
                    that.el.scrollLeft=x;
                } else {
                    var scrollLeft=x<0?0:maxX;
                    that.el.scrollLeft=scrollLeft;
                    bounceX=scrollLeft-x;
                }
            }

            if(that.options.vScroll) {
                that.y=y;

                if(y>=0&&y<=maxY) {
                    that.el.scrollTop=y;
                } else {
                    var scrollTop=y<0?0:maxY;
                    that.el.scrollTop=scrollTop;
                    bounceY=scrollTop-y;
                }
            }

            if(bounceX!=0||bounceY!=0)
                that.$el.css({ '-webkit-transform': 'translate('+bounceX+'px,'+bounceY+'px) translateZ(0)' }),that._bounceChanged=true;
            else if(that._bounceChanged)
                that.$el.css({ '-webkit-transform': 'translate(0px,0px) translateZ(0)' }),that._bounceChanged=false;

            that.onScroll&&that.onScroll(that.x,that.y);
        }
    });

    module.exports=Scroll;
});
