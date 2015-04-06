define(['$','util','./../base','./../view','./../tween'],function (require,exports,module) {
    var $=require('$'),
        util=require('util'),
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
    var _momentum=tween._momentum;

    function addScrollInner($scroll,refresh) {
        var el=$('<div class="sl_scroll_inner" style="width:100%;-webkit-transform: translate(0px,0px) translateZ(0);"></div>').append($scroll.children()).appendTo($scroll.html(''));

        if(refresh) {
            el.css({ marginTop: -40 }).prepend('<div style="height:40px;background:#ddd;text-align:center;line-height:40px;">下拉刷新</div>')
        }

        return el;
    };

    var Scroll=view.extend({
        events: {
            'touchstart': '_start',
            'touchmove': '_move',
            'touchend': '_end'
        },

        options: {
            ease: "ease",
            bounce: true,
            hScroll: false,
            vScroll: true
        },
        initialize: function () {
            var that=this;

            if(that.onScroll) that.on('Scroll',$.proxy(that.onScroll,that));
            if(that.options.useTransform===true) that.useTransform=true;

            that.init();

            if(that.useTransform) {
                var $scroll=this.$scroll;
                that.$scrollInner=addScrollInner($scroll,that.options.refresh);
                that.scrollInner=that.$scrollInner[0];
                $scroll.css({ overflow: 'hidden' });
            }
        },

        init: function () {
            this.$scroll=this.$el;
            this.scroll=this.el;
        },

        useTransform: util.isAndroid&&util.osVersion=="4.0",

        x: 0,
        y: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        minDelta: 6,

        start: function () {
            var that=this;

            that.maxX=that.scrollerW-that.wrapperW;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;
            that.minX=0;

            return that.options.bounce?true:((that.wrapperW<that.scrollerW||that.wrapperH<that.scrollerH)==true);
        },

        refresh: function () {
            var that=this;
            that.x=that.scroll.scrollLeft;
            that.y=that.scroll.scrollTop;

            that.wrapperW=that.scroll.clientWidth;
            that.wrapperH=that.scroll.clientHeight;

            that.scrollerW=that.useTransform?that.scrollInner.scrollWidth:that.scroll.scrollWidth;
            that.scrollerH=that.useTransform?that.scrollInner.scrollHeight:that.scroll.scrollHeight;
        },

        stopAnimate: function () {
            var ani=this._aniTimer;
            if(ani) {
                ani.stop();
                this._aniTimer=0;
                this._isClickStopAni=true;
                return true;
            }
            else return false;
        },

        animate: function (x,y,duration,callback) {
            var that=this,
                fromX=that.x,
                fromY=that.y;

            if($.isPlainObject(duration))
                callback=duration;

            if($.isPlainObject(callback))
                duration=callback.duration,callback=callback.callback;

            !duration&&(duration=200);

            tween.animate(function (d) {
                var cx=fromX+(x-fromX)*d,
                    cy=fromY+(y-fromY)*d;

                that.pos(m.round(cx),m.round(cy));
                that._aniTimer=this;

            },duration,this.options.ease||'ease',function () {
                that._aniTimer=null;
                that._isClickStopAni=true;
                callback&&callback.call(that,x,y);
            });
        },

        bounceBack: function () {
            var that=this;
            var newX=that.x<that.minX?that.minX:that.x>that.maxX?that.maxX:that.x;
            var newY=that.y<that.minY?that.minY:that.y>that.maxY?that.maxY:that.y;
            that._bounceChanged=false;

            if(newX!=that.x||newY!=that.y) {
                that.animate(newX,newY,400,that.onScrollStop);

            } else {
                that.onScrollStop();
            }
        },

        end: function () {
            this.options.bounce?this.bounceBack():this.onScrollStop();
        },

        onScroll: null,

        onScrollStop: function () {
            this.$scroll.trigger('scrollStop');
        },

        _start: function (e) {
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

        _move: function (e) {
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
                    if(!that.isRefresh) that.refresh(),that.isRefresh=true;

                    that._isStart=(isV&&that.options.vScroll||isH&&that.options.hScroll)&&(that.start()!==false);
                    if(that._isStop=!that._isStart) return;

                    if(that.maxX<0) that.maxX=0;
                    if(that.maxY<0) that.maxY=0;
                    that.startX=that.x;
                    that.startY=that.y;

                } else
                    return false;
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

        _end: function (e) {
            var that=this;
            if((!that._moved||that._isStop)&&that._isClickStopAni) {
                that.end();
                that._isClickStopAni=false;
            }

            if(that._isStop) return;
            that._isStop=true;

            if(!that._moved||hasTouch&&e.touches.length!==0) return;

            $(e.target).trigger('touchcancel');

            var point=hasTouch?e.changedTouches[0]:e,
                target,
                momentumX={ dist: 0,time: 0,outside: 0 },
                momentumY={ dist: 0,time: 0,outside: 0 },
                duration=(e.timeStamp||Date.now())-that.startTime,
                newPosX=that.x,
                newPosY=that.y,
                newDuration;

            e.preventDefault();

            if(duration<300) {
                momentumX=newPosX?_momentum(that.startX,that.x,duration,that.maxX,that.minX,that.options.bounce?(that.wrapperW||window.innerWidth):0):momentumX;
                momentumY=newPosY?_momentum(that.startY,that.y,duration,that.maxY,that.minY,that.options.bounce?(that.wrapperH||window.innerHeight):0):momentumY;

                newPosX=that.x+momentumX.dist;
                newPosY=that.y+momentumY.dist;

                if(!that.options.hScroll||(that.x<that.minX&&newPosX<that.minX)||(that.x>that.maxX&&newPosX>that.maxX))
                    momentumX={ dist: 0,time: 0,outside: 0 },newPosX=that.x;

                if(!that.options.vScroll||(that.y<that.minY&&newPosY<that.minY)||(that.y>that.maxY&&newPosY>that.maxY))
                    momentumY={ dist: 0,time: 0,outside: 0 },newPosY=that.y;
            }

            if(momentumX.dist||momentumY.dist) {
                newDuration=m.max(m.max(momentumX.time,momentumY.time),10);

                if(momentumY.outside!=0) newPosY=newPosY-momentumY.outside+momentumY.outside*400/newDuration;
                if(momentumX.outside!=0) newPosX=newPosX-momentumX.outside+momentumX.outside*400/newDuration;

                that._startAni(m.round(newPosX),m.round(newPosY),newDuration);
            } else {
                that.end();
            }
        },

        _startAni: function (x,y,duration) {
            this.animate(x,y,duration,this.end);
        },

        pos: function (x,y) {
            //this.y=y;
            //this.$scroll.css({ '-webkit-transform': 'translate('+0+'px,'+y* -1+'px) translateZ(0)' });

            this._pos(x,y);
        },

        _pos: function (x,y) {
            var that=this;
            x=m.round(x);
            y=m.round(y);

            if(that.x==x&&that.y==y) return;

            var maxX=that.scrollerW-that.wrapperW;
            var maxY=that.scrollerH-that.wrapperH;
            var bounceX=0;
            var bounceY=0;

            if(this.useTransform) {
                if(that.options.hScroll) {
                    that.x=x;
                }
                if(that.options.vScroll) {
                    that.y=y;
                }
                that.$scrollInner.css({ '-webkit-transform': 'translate('+that.x* -1+'px,'+that.y* -1+'px) translateZ(0)' }),that._bounceChanged=true;

            } else {
                if(that.options.hScroll) {
                    that.x=x;

                    if(x>=0&&x<=maxX) {
                        that.scroll.scrollLeft=x;
                    } else {
                        var scrollLeft=x<0?0:maxX;
                        that.scroll.scrollLeft=scrollLeft;
                        bounceX=scrollLeft-x;
                    }
                }

                if(that.options.vScroll) {
                    that.y=y;

                    if(y>=0&&y<=maxY) {
                        that.scroll.scrollTop=y;
                    } else {
                        var scrollTop=y<0?0:maxY;
                        that.scroll.scrollTop=scrollTop;
                        bounceY=scrollTop-y;
                    }
                }

                if(bounceX!=0||bounceY!=0)
                    that.$scroll.css({ '-webkit-transform': 'translate('+bounceX+'px,'+bounceY+'px) translateZ(0)' }),that._bounceChanged=true;
                else if(that._bounceChanged)
                    that.$scroll.css({ '-webkit-transform': 'translate(0px,0px) translateZ(0)' }),that._bounceChanged=false;
            }

            that.trigger('scroll',that.x,that.y);
        }
    });

    function refreshStart(e) {
        var target=e.currentTarget;
        var point=hasTouch?e.touches[0]:e;
        target._sy=point.pageY;
        target._st=target.scrollTop;
    }

    function refreshMove(e) {
        var target=e.currentTarget;
        var point=hasTouch?e.touches[0]:e;
        var deltaY=point.pageY-target._sy;
        var $child=$(target.firstChild);

        if(target.scrollTop<=0&&deltaY>0) {
            e.preventDefault();

            target._startRefresh=true;
            target._rY=(target._st-deltaY)* -.5;

            $child.css({ '-webkit-transform': 'translate(0px,'+target._rY+'px) translateZ(0)' });
        }
    }

    function refreshEnd(e) {
        var target=e.currentTarget;

        if(target._startRefresh) {
            var point=hasTouch?e.changedTouches[0]:e;
            var $child=$(target.firstChild);
            var from=target._rY;
            var end=0;
            var y;

            target._startRefresh=false;

            tween.animate(function (d) {
                y=from+(end-from)*d;

                $child.css({ '-webkit-transform': 'translate(0px,'+y+'px) translateZ(0)' });

            },200);
        }
    }

    Scroll.bind=function (selector,options) {
        //<--debug
        options={
            useScroll: true,
            refresh: false,
            useTransform: true
        }
        //debug-->

        var $scroll=typeof selector==='string'?$(selector):selector;
        var result=[];

        $scroll.on('scroll',function () {
            var that=this;
            if(that._stm) clearTimeout(that._stm);
            that._stm=setTimeout(function () {
                //for ios
                that._scrollTop=that.scrollTop;

                $(that).trigger('scrollStop');
            },80);
        });

        if(options&&options.useScroll||util.android&&parseFloat(util.osVersion<=2.3)) {
            $scroll.each(function () {
                result.push(new Scroll(this,options));
            });
        }

        else if(util.ios) {
            $scroll.css({
                '-webkit-overflow-scrolling': 'touch',
                overflowY: 'scroll'
            })
            .on('touchend',function (e) {
                if(this._scrollTop!==this.scrollTop) {
                    this._scrollTop=this.scrollTop;
                    e.stopPropagation();
                }
            }).each(function () {
                this._scrollTop=0;
            }),
            result.push({
                destory: function () {
                    $scroll.off('touchend').off('scroll');
                }
            });
        }

        else if(util.android) {
            $scroll.css({ overflowY: 'scroll' });
        }

        if(options&&options.refresh) {

            var $inner=$scroll.children('.sl_scroll_inner');
            if(!$inner.length) $inner=addScrollInner($scroll,true);

            $scroll.on('touchstart',refreshStart)
                .on('touchmove',refreshMove)
                .on('touchend',refreshEnd);
        }

        return result;
    };

    module.exports=Scroll;
});
