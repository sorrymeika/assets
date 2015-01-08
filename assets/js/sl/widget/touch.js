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
        },
        x: 0,
        y: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        minDelta: 6,
        start: function() {
            var that=this;
            this.minX=0;
            this.maxX=0;
            this.minY=0;
            this.maxY=this.el.offsetHeight;
            return true;
        },

        move: function(x,y) {
        },

        end: function() {
        },

        stop: function() {
            this.options.bounce&&this.bounceBack();
            this.end();
        },

        bounce: function(bounceX,bounceY) {
            this.$el.css({ '-webkit-transform': 'translate('+bounceX+'px,'+(bounceY)+'px) translateZ(0)' });
        },

        bounceBack: function() {
            var that=this;
            if(that.y!=that._y||that.x!=that._x) {
                that.$el.animate({ '-webkit-transform': 'translate(0px,0px) translateZ(0)' },200,'ease-out',function() {
                    that.$el.css({ '-webkit-transform': '' });
                });
                that.y=that._y;
                that.x=that._x;
            }
        },

        _transitionTime: function(time) {
            time+='ms';
            this.el.style['-webkit-transition-duration']=time;
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
            if(that._isMomentum) {
                that._isMomentumStop=true;
                that._isMomentum=false;
            } else {
                that._isMomentumStop=false;
            }
            that._isStopMomentum=true;
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
                    that._isStart=(isV&&that.options.vScroll||isH&&that.options.hScroll)&&(that.start()!==false);
                    if(that._isStop=!that._isStart) return;

                    that.startX=that.x;
                    that.startY=that.y;
                    that._x=that.x;
                    that._y=that.y;
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

            that._moving(newX,newY);

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=that.x;
                that.startY=that.y;
            }
        },

        _end: function(e) {
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
                if(that._isMomentumStop) {
                    that.stop();
                }
                return;
            }

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

                that._moving(m.round(newPosX),m.round(newPosY),newDuration);
            } else {
                that.stop();
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

        animate: function(x,y,duration,fn) {
            var that=this;
            var start=0,
                during=duration,
                fromX=that.x,
                fromY=that.y,
                startTime=Date.now(),
                _run=function() {
                    if(that._isStopMomentum) {
                        return;
                    }
                    start=Date.now()-startTime;

                    var cx=easeOut(start,fromX,x-fromX,during),
                        cy=easeOut(start,fromY,y-fromY,during);

                    if(start<=during) {
                        fn.call(that,cx,cy);
                        requestAnimationFrame(_run);
                    } else {
                        fn.call(that,x,y);
                        that._isStopMomentum=true;
                        that.stop();
                    }
                };

            !fn&&(fn=that._moving);
            that._isStopMomentum=false;
            that._isMomentum=true;
            _run();
        },

        _startAni: function(x,y,duration) {
            this.animate(x,y,duration);
        },

        _moving: function(x,y,duration) {
            var that=this;

            if(typeof duration!='undefined') {
                that._startAni(x,y,duration);

            } else {
                var bounceX=0;
                var bounceY=0;

                if(x!=that.x) {
                    if(that.options.bounce&&that.options.hScroll&&(x<that.minX||x>that.maxX)) {
                        bounceX=x<that.minX?x-that.minX:x-that.maxX;
                        bounceX= -1*bounceX/2;
                    }

                    that.x=x;
                    x=x<that.minX?that.minX:x>=that.maxX?that.maxX:x;
                }

                if(y!=that.y) {
                    if(that.options.bounce&&that.options.vScroll&&(y<that.minY||y>that.maxY)) {
                        bounceY=y<that.minY?y-that.minY:y-that.maxY;
                        bounceY= -1*bounceY/2;
                    }
                    that.y=y;
                    y=y<that.minY?that.minY:y>=that.maxY?that.maxY:y;
                }

                if(bounceX!=0||bounceY!=0) that.bounce(bounceX,bounceY);

                if(that._y!=y||that._x!=x) {
                    that._y=y;
                    that._x=x;
                    that.move(x,y);
                }
            }
        }
    });

    module.exports=Touch;
});
