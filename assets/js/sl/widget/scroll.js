define(function(require,exports,module) {
    var $=require('$'),
        sl=require('./../base'),
        view=require('./../view'),
        tween=require('./../tween'),
        hasTouch='ontouchstart' in window,
        m=Math,
        easeOut=tween.Quad.easeOut;

    var Scroll=view.extend({
        events: {
            'touchstart': '_start',
            'touchmove': '_move',
            'touchend': '_end'
        },

        _start: function(e) {
            var that=this,
                point=hasTouch?e.touches[0]:e;
            that.stop=true;

            that.x=that.el.scrollLeft;
            that.y=that.el.scrollTop;

            that.startX=that.x;
            that.startY=that.y;
            that.pointX=point.pageX;
            that.pointY=point.pageY;

            that.startTime=e.timeStamp||Date.now();
            that.moved=false;

            that.wrapperW=that.el.clientWidth;
            that.wrapperH=that.el.clientHeight;

            that.scrollerW=that.el.scrollWidth;
            that.scrollerH=that.el.scrollHeight;

            that.maxScrollX=that.scrollerW-that.wrapperW;
            that.maxScrollY=that.scrollerH-that.wrapperH;
            that.minScrollY=0;

            that._isStart=that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH;
        },

        _move: function(e) {
            if(!this._isStart) return;
            e.preventDefault();

            var that=this,
                point=hasTouch?e.touches[0]:e,
                deltaX=that.pointX-point.pageX,
                deltaY=that.pointY-point.pageY,
                newX=that.x+deltaX,
                newY=that.y+deltaY,
                timestamp=e.timeStamp||Date.now();

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            that.distX+=deltaX;
            that.distY+=deltaY;
            that.absDistX=m.abs(that.distX);
            that.absDistY=m.abs(that.distY);

            if(that.absDistX<6&&that.absDistY<6) {
                return;
            }

            that.moved=true;

            that.scrollTo(newX,newY);

            that.dirX=deltaX>0?-1:deltaX<0?1:0;
            that.dirY=deltaY>0?-1:deltaY<0?1:0;

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=that.x;
                that.startY=that.y;
            }

        },

        _end: function(e) {
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

            if(!that.moved) {
                return;
            }

            e.preventDefault();

            if(duration<300) {
                momentumX=newPosX?that._momentum(newPosX-that.startX,duration,that.maxScrollX-that.x,that.x,that.options.bounce?that.wrapperW:0):momentumX;
                momentumY=newPosY?that._momentum(newPosY-that.startY,duration,that.maxScrollY-that.y,that.y,that.options.bounce?that.wrapperH:0):momentumY;

                newPosX=that.x+momentumX.dist;
                newPosY=that.y+momentumY.dist;

                if((that.x<0&&newPosX<0)||(that.x>that.maxScrollX&&newPosX>that.maxScrollX)) momentumX={ dist: 0,time: 0 };
                if((that.y<that.minScrollY&&newPosY<that.minScrollY)||(that.y>that.maxScrollY&&newPosY>that.maxScrollY)) momentumY={ dist: 0,time: 0 };
            }

            if(momentumX.dist||momentumY.dist) {
                newDuration=m.max(m.max(momentumX.time,momentumY.time),10);

                that.scrollTo(m.round(newPosX),m.round(newPosY),newDuration);
                return;
            }

        },

        _momentum: function(dist,time,maxDistUpper,maxDistLower,size) {
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

        initialize: function() {
            console.log(this.el)
        },

        scrollTo: function(x,y,duration) {
            var that=this;

            if(duration&&duration!==0) {

                var start=0,
                    during=duration,
                    fromX=that.x,
                    fromY=that.y,
                    startTime=Date.now(),
                    _run=function() {
                        if(that.stop) return;
                        start=Date.now()-startTime;

                        var cx=easeOut(start,fromX,x-fromX,during),
                            cy=easeOut(start,fromY,y-fromY,during);

                        if(start<=during) {
                            that.scrollTo(cx,cy);
                            requestAnimationFrame(_run);
                        } else {
                            that.scrollTo(x,y);
                            that.stop=true;
                        }
                    };
                that.stop=false;
                _run();

            } else {
                x=x<0?0:x>=that.maxScrollX?that.maxScrollX:x;
                if(x!=that.x) {
                    that.el.scrollLeft=x;
                    that.x=x;
                }
                y=y<0?0:y>=that.maxScrollY?that.maxScrollY:y;
                if(y!=that.y) {
                    that.el.scrollTop=y;
                    that.y=y;
                }

                that.$el.trigger('scrollChange',[x,y]);
            }
        }
    });

    return Scroll;
});
