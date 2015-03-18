define(["./linklist"],function(require) {
    var $=require("$");
    var L=require("./linklist");

    var list;
    var animationStop=true;

    var run=function() {

        if(!L.isEmpty(list)) {
            animationStop=false;

            var start,
                ease,
                arr;

            while(first=L.peek(list)) {
                start=Date.now()-first.startTime;
                arr=[];
                ease=first.ease,
                ret={
                    stop: (function() {
                        return function() {
                            L.remove(first);
                        }
                    })(first)
                };

                if(start<=first.duration) {
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(ease[i](start,from,to,duration)/to);
                    }
                    first.step.apply(ret,arr);

                } else {
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(1);
                    }
                    first.step.apply(ret,arr);
                    L.remove(first);
                    first.callback&&first.callback();
                }

                L.remove(first);
            }

            requestAnimationFrame(run);
        } else {
            animationStop=true;
        }
    };

    function parallel(animations) {

        if(!list||L.isEmpty(list)) {
            list=animations.shift();
            L.init(list);
        }

        for(var i=0,n=animations.length,item;i<n;i++) {
            item=animations[i];
            item.startTime=Date.now();
            item.ease=_ease(item.ease);
            if(!item.duration) item.duration=300;

            L.append(list,item);
        }

        if(animationStop)
            run();
    }

    function _ease(ease) {
        if(!ease) ease=[Tween.easeOut];
        else {
            if(!(ease instanceof Array)) ease=[ease];

            for(var i=0,n=ease.length;i<n;i++) {
                if(typeof ease[i]=="string")
                    ease[i]=Tween[ease[i].replace(/\-([a-z])/g,function($0,$1) {
                        return $1.toUpperCase();
                    })];
            }
        }
        return ease;
    }

    var Tween={
        parallel: parallel,
        animate: function(step,duration,ease,callback) {
            this.parallel([{
                step: step,
                duration: duration,
                ease: ease,
                callback: callback
            }]);

            return;

            ease=_ease(ease);

            !duration&&(duration=300);

            var start=0,
                from=0,
                to=100,
                ret={
                    aniTimer: 0,
                    stop: function() {
                        if(ret.aniTimer)
                            cancelAnimationFrame(ret.aniTimer),ret.aniTimer=0;
                    }
                },
                startTime=Date.now(),
                _run=function() {
                    start=Date.now()-startTime;

                    if(start<=duration) {
                        var arr=[];
                        for(var i=0,n=ease.length;i<n;i++) {
                            arr.push(ease[i](start,from,to,duration)/to);
                        }
                        step.apply(ret,arr);
                        ret.aniTimer=requestAnimationFrame(_run);
                    } else {
                        step.call(ret,1);
                        callback&&callback();
                    }
                };

            _run();

            return ret;
        },
        linear: function(t,b,c,d) { return c*t/d+b; },
        ease: function(t,b,c,d) {
            //return c*((t=t/d-1)*t*t*t*t+1)+b;
            return -c*((t=t/d-1)*t*t*t-1)+b;
        },
        easeIn: function(t,b,c,d) {
            return c*(t/=d)*t+b;
        },
        easeOut: function(t,b,c,d) {
            return -c*(t/=d)*(t-2)+b;
        },
        easeInOut: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t+b;
            return -c/2*((--t)*(t-2)-1)+b;
        },
        easeInCubic: function(t,b,c,d) {
            return c*(t/=d)*t*t+b;
        },
        easeOutCubic: function(t,b,c,d) {
            return c*((t=t/d-1)*t*t+1)+b;
        },
        easeInOutCubic: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t+b;
            return c/2*((t-=2)*t*t+2)+b;
        },
        easeInQuart: function(t,b,c,d) {
            return c*(t/=d)*t*t*t+b;
        },
        easeOutQuart: function(t,b,c,d) {
            return -c*((t=t/d-1)*t*t*t-1)+b;
        },
        easeInOutQuart: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t*t+b;
            return -c/2*((t-=2)*t*t*t-2)+b;
        },
        easeInQuint: function(t,b,c,d) {
            return c*(t/=d)*t*t*t*t+b;
        },
        easeOutQuint: function(t,b,c,d) {
            return c*((t=t/d-1)*t*t*t*t+1)+b;
        },
        easeInOutQuint: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t*t*t+b;
            return c/2*((t-=2)*t*t*t*t+2)+b;
        },
        easeInSine: function(t,b,c,d) {
            return -c*Math.cos(t/d*(Math.PI/2))+c+b;
        },
        easeOutSine: function(t,b,c,d) {
            return c*Math.sin(t/d*(Math.PI/2))+b;
        },
        easeInOutSine: function(t,b,c,d) {
            return -c/2*(Math.cos(Math.PI*t/d)-1)+b;
        },
        easeInExpo: function(t,b,c,d) {
            return (t==0)?b:c*Math.pow(2,10*(t/d-1))+b;
        },
        easeOutExpo: function(t,b,c,d) {
            return (t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;
        },
        easeInOutExpo: function(t,b,c,d) {
            if(t==0) return b;
            if(t==d) return b+c;
            if((t/=d/2)<1) return c/2*Math.pow(2,10*(t-1))+b;
            return c/2*(-Math.pow(2,-10* --t)+2)+b;
        },
        easeInCirc: function(t,b,c,d) {
            return -c*(Math.sqrt(1-(t/=d)*t)-1)+b;
        },
        easeOutCirc: function(t,b,c,d) {
            return c*Math.sqrt(1-(t=t/d-1)*t)+b;
        },
        easeInOutCirc: function(t,b,c,d) {
            if((t/=d/2)<1) return -c/2*(Math.sqrt(1-t*t)-1)+b;
            return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b;
        },
        easeInElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d)==1) return b+c;if(!p) p=d*.3;
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
        },
        easeOutElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d)==1) return b+c;if(!p) p=d*.3;
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            return (a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b);
        },
        easeInOutElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d/2)==2) return b+c;if(!p) p=d*(.3*1.5);
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            if(t<1) return -.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
            return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*.5+c+b;
        },
        easeInBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            return c*(t/=d)*t*((s+1)*t-s)+b;
        },
        easeOutBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
        },
        easeInOutBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            if((t/=d/2)<1) return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;
        },
        easeInBounce: function(t,b,c,d) {
            return c-Tween.Bounce.easeOut(d-t,0,c,d)+b;
        },
        easeOutBounce: function(t,b,c,d) {
            if((t/=d)<(1/2.75)) {
                return c*(7.5625*t*t)+b;
            } else if(t<(2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b;
            } else if(t<(2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b;
            }
        },
        easeInOutBounce: function(t,b,c,d) {
            if(t<d/2) return Tween.easeInOutBounce(t*2,0,c,d)*.5+b;
            else return Tween.easeInOutBounce(t*2-d,0,c,d)*.5+c*.5+b;
        }
    };

    (function() {
        var lastTime=0;
        var vendors=['webkit','moz'];
        for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x) {
            window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if(!window.requestAnimationFrame) {
            window.requestAnimationFrame=function(callback) {
                var currTime=new Date().getTime();
                var timeToCall=Math.max(0,16.7-(currTime-lastTime));
                var id=window.setTimeout(function() {
                    callback(currTime+timeToCall);
                },timeToCall);
                lastTime=currTime+timeToCall;
                return id;
            };
        }
        if(!window.cancelAnimationFrame) {
            window.cancelAnimationFrame=function(id) {
                clearTimeout(id);
            };
        }
    } ());

    return Tween;
});
