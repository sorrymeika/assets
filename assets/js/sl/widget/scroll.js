define(['$','./../base','./../view','./../tween'],function (require,exports,module) {
    var $=require('$'),
        sl=require('./../base'),
        view=require('./../view'),
        tween=require('./../tween'),
        hasTouch='ontouchstart' in window,
        m=Math,
        easeOut=tween.Quad.easeOut;

    var Scroll=view.extend({
        options: {
            bounce: true,
            hScroll: false
        },

        events: {
            'touchstart': '_start',
            'touchmove': '_move',
            'touchend': '_end'
        },

        refresh: function () {
            var that=this;

            that.x=that.el.scrollLeft;
            that.y=that.el.scrollTop;

            that.startX=that.x;
            that.startY=that.y;

            that.wrapperW=that.el.clientWidth;
            that.wrapperH=that.el.clientHeight;

            that.scrollerW=that.el.scrollWidth;
            that.scrollerH=that.el.scrollHeight;

            that.maxScrollX=that.scrollerW-that.wrapperW;
            that.maxScrollY=that.scrollerH-that.wrapperH;
            that.minScrollY=0;

            that._isStart=that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH;
            that._isStop=!that._isStart;
        },

        _start: function (e) {
            var that=this,
                point=hasTouch?e.touches[0]:e;

            that.pointX=point.pageX;
            that.pointY=point.pageY;
            that.startTime=e.timeStamp||Date.now();

            that._isStop=false;
            that._isStart=false;
            that._isStopScroll=true;
            that._moved=false;
        },

        _move: function (e) {
            if(this._isStop) return;

            if(e.isDefaultPrevented()) {
                this._isStop=true;
                return;
            }
            e.preventDefault();

            var that=this;
            var point=hasTouch?e.touches[0]:e;
            var deltaX=that.pointX-point.pageX;
            var deltaY=that.pointY-point.pageY;

            if(!that._isStart) {
                if(m.abs(deltaX)>=6||m.abs(deltaY)>=6) {
                    that.refresh();
                    that.pointX=point.pageX;
                    that.pointY=point.pageY;
                }
                return;
            }

            var newX=that.x+deltaX,
                newY=that.y+deltaY,
                timestamp=e.timeStamp||Date.now();

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            that._moved=true;

            that.scrollTo(newX,newY);

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=that.x;
                that.startY=that.y;
            }
        },

        _end: function (e) {
            this._isStop=true;

            if(hasTouch&&e.touches.length!==0) return;

            var that=this,
                point=hasTouch?e.changedTouches[0]:e,
                target,ev,
                momentumX={ dist: 0,time: 0 },
                momentumY={ dist: 0,time: 0 },
                duration=(e.timeStamp||Date.now())-that.startTime,
                newPosX=that.x,
                newPosY=that.y,
                newDuration;

            if(!that._moved) {
                return;
            }

            e.preventDefault();

            if(duration<300) {
                momentumX=newPosX?that._momentum(newPosX-that.startX,duration,that.maxScrollX-that.x,that.x,that.options.bounce?that.wrapperW:0):momentumX;
                momentumY=newPosY?that._momentum(newPosY-that.startY,duration,that.maxScrollY-that.y,that.y-that.minScrollY,that.options.bounce?that.wrapperH:0):momentumY;

                newPosX=that.x+momentumX.dist;
                newPosY=that.y+momentumY.dist;

                if((that.x<0&&newPosX<0)||(that.x>that.maxScrollX&&newPosX>that.maxScrollX)) momentumX={ dist: 0,time: 0 };
                if((that.y<that.minScrollY&&newPosY<that.minScrollY)||(that.y>that.maxScrollY&&newPosY>that.maxScrollY)) momentumY={ dist: 0,time: 0 };
            }

            if(momentumX.dist||momentumY.dist) {
                newDuration=m.max(m.max(momentumX.time,momentumY.time),10);

                that.scrollTo(m.round(newPosX),m.round(newPosY),newDuration);
                return;
            } else {
                that._bounceBack();
            }

        },

        _bounceBack: function () {
            var that=this;
            that.$el.animate({ translate: '0px,0px' },200,'ease-out',function () {
                that.$el.css({ '-webkit-transform': '' });
            });
            that.y=that.el.scrollTop;
        },

        //dist:单位时间内滚动的距离
        //time:单位时间
        //maxDistUpper: 最大向上滚动距离
        //maxDistLower: 最大向下滚动距离
        //size:反弹距离
        _momentum: function (dist,time,maxDistUpper,maxDistLower,size) {
            var deceleration=0.0006,
                speed=m.abs(dist)/time,
                newDist=(speed*speed)/(2*deceleration),
                newTime=0,outsideDist=0;

            if(dist>0&&newDist>maxDistUpper) {
                outsideDist=size/(6/(newDist/speed*deceleration));
                maxDistUpper=maxDistUpper+outsideDist;
                speed=speed*maxDistUpper/newDist;
                newDist=maxDistUpper;
            } else if(dist<0&&newDist>maxDistLower) {
                outsideDist=size/(6/(newDist/speed*deceleration));
                maxDistLower=maxDistLower+outsideDist;
                speed=speed*maxDistLower/newDist;
                newDist=maxDistLower;
            }

            newDist=newDist*(dist<0?-1:1);
            newTime=speed/deceleration;

            return { dist: newDist,time: m.round(newTime) };
        },

        initialize: function () {
        },

        scrollTo: function (x,y,duration) {
            var that=this;

            if(duration&&duration!==0) {

                var start=0,
                    during=duration,
                    fromX=that.x,
                    fromY=that.y,
                    startTime=Date.now(),
                    _run=function () {
                        if(that._isStopScroll) return;
                        start=Date.now()-startTime;

                        var cx=easeOut(start,fromX,x-fromX,during),
                            cy=easeOut(start,fromY,y-fromY,during);

                        if(start<=during) {
                            that.scrollTo(cx,cy);
                            requestAnimationFrame(_run);
                        } else {
                            that.scrollTo(x,y);
                            that._isStopScroll=true;
                            that._bounceBack();
                        }
                    };
                that._isStopScroll=false;
                _run();

            } else {
                x=x<0?0:x>=that.maxScrollX?that.maxScrollX:x;
                if(x!=that.x) {
                    that.options.hScroll&&(that.el.scrollLeft=x);
                    that.x=x;
                }
                if(y!=that.y) {
                    if(y<that.minScrollY||y>that.maxScrollY) {
                        var bounce=y<that.minScrollY?y-that.minScrollY:y-that.maxScrollY;
                        that.$el.css({ '-webkit-transform': 'translate(0px,'+(-1*bounce/2)+'px)' });
                    }
                    that.y=y;
                    y=y<that.minScrollY?that.minScrollY:y>=that.maxScrollY?that.maxScrollY:y;
                    that.el.scrollTop=y;
                }
                that.$el.trigger('scrollChange',[x,y]);
            }
        }
    });

    return Scroll;
});
