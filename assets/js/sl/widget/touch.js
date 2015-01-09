define(['$','./../base','./../view','./../tween'],function(require,exports,module) {
    var $=require('$'),
        view=require('./../view'),
        tween=require('./../tween'),
        hasTouch='ontouchstart' in window,
        m=Math,
        easeOut=tween.Quad.easeOut;

    var Touch=view.extend({
        events: {
            'touchstart': '_start',
            'touchmove': '_move',
            'touchend': '_end'
        },

        options: {
            bounce: false,
            hScroll: true,
            vScroll: true
        },
        initialize: function() {
            this.$scroll=this.$el;
            this.scroll=this.el;
        },
        x: 0,
        y: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        bounceX: 0,
        bounceY: 0,
        minDelta: 6,
        start: function() {
            var that=this;
            this.minX=0;
            this.maxX=0;
            this.minY=0;
            this.maxY=this.scroll.offsetHeight;
            return true;
        },
        _aniTimer: 0,

        stopAnimate: function() {
            this._aniTimer&&(cancelAnimationFrame(this._aniTimer),this._aniTimer=0,this._isAniStop=true);
        },

        animate: function(x,y,duration,fn) {
            var that=this;
            var start=0,
                during=duration,
                fromX=that._posX,
                fromY=that._posY,
                startTime=Date.now(),
                _run=function() {
                    start=Date.now()-startTime;

                    if(start<=during) {
                        var cx=easeOut(start,fromX,x-fromX,during),
                            cy=easeOut(start,fromY,y-fromY,during);

                        fn.call(that,m.round(cx),m.round(cy));
                        that._aniTimer=requestAnimationFrame(_run);
                    } else {
                        fn.call(that,x,y);

                        that.end();
                    }
                };

            !fn&&(fn=that.pos);
            _run();
        },

        _pos: function(x,y) {
            var that=this;
            var maxX=that.scrollerW-that.wrapperW;
            var maxY=that.scrollerH-that.wrapperH;
            var bounceX=0;
            var bounceY=0;
            if(that._posX==x&&that._posY==y) return;

            if(x>=0&&x<=maxX) {
                that.scroll.scrollLeft=x;
            } else {
                that.scroll.scrollLeft=that._x;
                bounceX=that._x-x;
            }

            that._posX=x;
            that._posY=y;

            if(y>=0&&y<=maxY) {
                that.scroll.scrollTop=y;
            } else {
                that.scroll.scrollTop=that._y;
                bounceY=that._y-y;
            }

            if(bounceX!=0||bounceY!=0)
                that.$scroll.css({ '-webkit-transform': 'translate('+bounceX+'px,'+bounceY+'px) translateZ(0)' });
            else
                that.$scroll.css({ '-webkit-transform': '' });

            that.onScroll&&that.onScroll(x,y);
        },

        bounceBack: function() {
            var that=this;
            if(that._posY!=that._y||that._posX!=that._x) {
                that.animate(that._x,that._y,200,that._pos);
                that.y=that._y;
                that.x=that._x;

            } else
                that.onScrollStop();
        },

        end: function() {
            this.options.bounce?this.bounceBack():this.onScrollStop();
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
            that.stopAnimate();
        },

        _refersh: function() {
            var that=this;
            that._x=that.x=that.scroll.scrollLeft;
            that._y=that.y=that.scroll.scrollTop;

            that.bounceX=0;
            that.bounceY=0;

            that.startX=that.x;
            that.startY=that.y;

            that.wrapperW=that.scroll.clientWidth;
            that.wrapperH=that.scroll.clientHeight;

            that.scrollerW=that.scroll.scrollWidth;
            that.scrollerH=that.scroll.scrollHeight;
        },

        _move: function(e) {
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
            e.preventDefault();

            var newX=that.x+deltaX,
                newY=that.y+deltaY,
                timestamp=e.timeStamp||Date.now();

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            that._moved=true;

            that.pos(newX,newY);

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=that.x;
                that.startY=that.y;
            }
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
                momentumX=newPosX?that._momentum(newPosX-that.startX,duration,that.maxX-that.x,that.x-that.minX,that.options.bounce?(that.wrapperW||window.innerWidth):0):momentumX;
                momentumY=newPosY?that._momentum(newPosY-that.startY,duration,that.maxY-that.y,that.y-that.minY,that.options.bounce?(that.wrapperH||window.innerHeight):0):momentumY;


                newPosX=that.x+momentumX.dist;
                newPosY=that.y+momentumY.dist;

                if((that.x<that.minX&&newPosX<that.minX)||(that.x>that.maxX&&newPosX>that.maxX)) momentumX={ dist: 0,time: 0 };
                if((that.y<that.minY&&newPosY<that.minY)||(that.y>that.maxY&&newPosY>that.maxY)) momentumY={ dist: 0,time: 0 };
            }

            if(momentumX.dist||momentumY.dist) {
                newDuration=m.max(m.max(momentumX.time,momentumY.time),10);

                that.pos(m.round(newPosX),m.round(newPosY),newDuration);
            } else {
                that.end();
            }
        },

        //dist:单位时间内滚动的距离
        //time:单位时间
        //maxDistUpper: 最大向上滚动距离
        //maxDistLower: 最大向下滚动距离
        //size:反弹距离
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

        _startMomentumAni: function(x,y,duration) {
            this.animate(x,y,duration);
        },

        pos: function(x,y,duration) {
            var that=this;

            if(typeof duration!='undefined') {
                that._startMomentumAni(x,y,duration);

            } else {

                that._x=x<that.minX?that.minX:x>=that.maxX?that.maxX:x;
                if(that.options.bounce&&that.options.hScroll&&(x<that.minX||x>that.maxX)) {
                    that.bounceX=(x<that.minX?x-that.minX:x-that.maxX)/2;
                    that.x=x;
                } else
                    that.x=that._x;

                if(y!=that.y) {
                    that._y=y<that.minY?that.minY:y>=that.maxY?that.maxY:y;
                    if(that.options.bounce&&that.options.vScroll&&(y<that.minY||y>that.maxY)) {
                        that.bounceY=(y<that.minY?y-that.minY:y-that.maxY)/2;
                        that.y=y;
                    } else
                        that.y=that._y;
                }

                that._pos(that._x+that.bounceX,that._y+that.bounceY);
            }
        }
    });

    module.exports=Touch;
});
