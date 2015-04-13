﻿define(['$','./event','./tween'],function(require,exports,module) {
    var $=require('$'),
        event=require('./event'),
        tween=require('./tween');

    var slice=Array.prototype.slice;

    var Touch=function(el,options) {
        var that=this,
            $el=$(el);

        that.$el=$el;
        that.el=$el[0];
        that.options=options;

        $el.on('touchstart',$.proxy(that._start,that))
            .on('touchmove',$.proxy(that._move,that))
            .on('touchend',$.proxy(that._end,that));
    }

    Touch.prototype={
        on: event.on,
        trigger: event.trigger,

        _stopMomentum: function() {
            if(this.momentum) {
                this.momentum.stop&&this.momentum.stop();
                this._isClickStopAni=true;
                return false;
            }
            else
                return true;
        },

        _start: function(e) {
            var that=this,
                point=e.touches[0];

            that.pointX=that.startX=point.pageX;
            that.pointY=that.startY=point.pageY;

            that.isTouchStop=false;
            that.isTouchStart=false;
            that.isTouchMoved=false;

            that.startTime=e.timeStamp||Date.now();

            return that._stopMomentum();
        },
        _move: function(e) {
            if(this.isTouchStop) return;

            var that=this,
                minDelta=12,
                point=e.touches[0],
                deltaX=that.startX-point.pageX,
                deltaY=that.startY-point.pageY,
                timestamp=e.timeStamp||Date.now();

            if(!that.isTouchStart) {
                var isDirectionX=Math.abs(deltaX)>=minDelta&&Math.abs(deltaX)>Math.abs(deltaY),
                    isDirectionY=Math.abs(deltaY)>=minDelta&&Math.abs(deltaY)>Math.abs(deltaX);

                if(isDirectionY||isDirectionX) {
                    that.isTouchStart=true;
                    that.isDirectionY=isDirectionY;
                    that.isDirectionX=isDirectionX;
                    that.dir=isDirectionX;

                    if(!that.isInit) {
                        that.trigger('init');
                        that.isInit=true;
                    }

                    that.trigger('start');

                    if(that.isTouchStop) {
                        /*
                        if(that._isClickStopAni) {
                        that.momentum.finish();
                        that._isClickStopAni=false;
                        }
                        */
                        return;
                    }

                } else {
                    return false;
                }
            }

            that.deltaX=deltaX;
            that.deltaY=deltaY;

            var moveEvent=event.createEvent('move');

            that.trigger(moveEvent,deltaX,deltaY);

            that.isTouchMoved=true;

            that.isMoveLeft=that.pointX-point.pageX>0?true:false;
            that.isMoveTop=that.pointY-point.pageY>0?true:false;

            that.pointX=point.pageX;
            that.pointY=point.pageY;

            if(timestamp-that.startTime>300) {
                that.startTime=timestamp;
                that.startX=point.pageX;
                that.startY=point.pageY;

                that.trigger('starttimereset');
            }
            return false;
        },

        stop: function() {
            this.isTouchStop=true;
        },

        addMomentumOptions: function(start,current,min,max,size,divisor) {
            this.momentumOptions.push([start||0,current||0,this.duration,min||0,max||0,size||0,divisor]);
            return this;
        },

        _momentum: function() {
            var args=slice.call(arguments);
            args.splice(0,0,'momentum');
            event.trigger.apply(this,args);
        },

        _stop: function() {
            this.momentum=null;
            this._isClickStopAni=false;
            this.trigger('stop');
        },

        _end: function(e) {
            var that=this;

            if((!that.isTouchMoved||that.isTouchStop)&&that._isClickStopAni) {
                that.momentum.finish();
                that._isClickStopAni=false;
                return;
            }

            if(!that.isTouchMoved) return;
            that.isTouchMoved=false;

            if(that.isTouchStop) return;
            that.isTouchStop=true;


            $(e.target).trigger('touchcancel');

            var point=e.changedTouches[0],
                target,
                duration=(e.timeStamp||Date.now())-that.startTime;

            that.duration=duration;

            if(duration<300||!that.momentum) {

                that.momentumOptions=[];
                that.trigger('beforemomentum',duration);

                that.momentum=tween.momentum(that.momentumOptions,that.options.maxDuration,that._momentum,that.options.ease||'ease',that._stop,that);

            } else {
                that.momentum.finish();
            }

            return false;
        },

        destory: function() {
            this.$el.off('touchstart',this._start)
                .off('touchmove',this._move)
                .off('touchend',this._end)
        }
    }

    return Touch;

});
