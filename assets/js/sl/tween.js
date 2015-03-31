define(['$',"./_linklist","graphics/matrix2d"],function(require) {
    var $=require("$");
    var L=require("./_linklist");
    var Matrix2D=require("graphics/matrix2d");

    var list;
    var listLength=0;
    var animationStop=true;
    var domBody=document.body;

    var run=function() {
        if(list) {
            animationStop=false;

            var start,
                ease,
                arr,
                prev,
                first=list,
                flag=false;

            var startTime= +new Date;

            do {
                prev=L.peek(first);

                //console.log(prev)

                start=Date.now()-first.startTime;
                arr=[];
                ease=first.ease;

                if(start<=first.duration) {
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(ease[i](start,0,100,first.duration)/100);
                    }
                    first.step.apply(first,arr);

                } else {
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(1);
                    }
                    first.step.apply(first,arr);

                    if(list==first) list=prev;
                    L.remove(first);
                    listLength--;

                    first.finish&&first.finish();
                }

                first=prev;
            }
            while(first&&first!=list);

            //$('header').html((+new Date)-startTime)


            requestAnimationFrame(run);
        } else {
            animationStop=true;
        }
    };

    function init(item) {
        item.startTime=Date.now();
        item.ease=_ease(item.ease);
        item.stop=function() {
            if(item===list) list=L.peek(list);
            L.remove(item);
            listLength--;
        };
        if(!item.duration) item.duration=300;

        return item;
    }

    function parallel(animations) {
        if(!list) {
            list=init(animations.shift());
            L.init(list);
            listLength++;
        }

        for(var i=0,n=animations.length,item;i<n;i++) {
            listLength++;
            L.append(list,init(animations[i]));
        }

        if(animationStop)
            run();
    }

    var TRANSFORM='-webkit-transform',
        numReg=/\d+\.\d+|\d+/g,
        percentReg=/(\d+\.\d+|\d+)\%/g,
        translatePercentReg=/translate\((\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\s*\,\s*(\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\)/,
        matrixReg=/matrix\((\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\)/,
        transformReg=/(translate|skew|rotate|scale|matrix)\(([^\)]+)\)/g,
        matrixEndReg=/matrix\([^\)]+\)\s*$/;

    function toFloatArr(arr) {
        var result=[];
        $.each(arr,function(i,item) {
            result.push(isNaN(parseFloat(item))?0:parseFloat(item))
        });
        return result;
    }

    function getCurrent(from,end,d) {
        return parseFloat(from)+(parseFloat(end)-parseFloat(from))*d;
    }

    function getMatrixByTransform(transform) {
        var m2d=new Matrix2D();
        transform.replace(transformReg,function($0,$1,$2) {
            m2d[$1=='matrix'?'append':$1].apply(m2d,toFloatArr($2.split(',')));
        });

        return m2d;
    }

    function parallelAnimate(animations) {
        var anims=[],
            anim,
            el,
            css,
            m2d,
            origTransform;

        for(var i=0,n=animations.length,item;i<n;i++) {
            anim=animations[i];

            if(anim.css) {
                css=toTransform(anim.css);
                anim.matrix=css.matrix;
                css=anim.css=css.css;

                anim.selector=anim.el;
                el=anim.el=$(anim.el);

                if(typeof anim.start==='object') {
                    el.transform(anim.start);
                }

                el.each(function() {
                    var animationStyle={},
                            originStyle={},
                            that=this,
                            style=getComputedStyle(that,null),
                            originVal;

                    $.each(css,function(key,val) {
                        if(typeof val==='string') {
                            if(key==TRANSFORM) {
                                val=val.replace(translatePercentReg,function($0,$1,$2) {
                                    return 'translate('+($1.indexOf('%')!== -1?that.offsetWidth*parseFloat($1)/100:parseFloat($1))+'px,'+($2.indexOf('%')!== -1?that.offsetHeight*parseFloat($2)/100:parseFloat($2))+'px)';
                                });
                                //console.log(val)
                            } else if(/^(top|margin(-t|T)op)$/.test(key)) {
                                val=val.replace(percentReg,function($0) {
                                    return that.parentNode.offsetHeight*parseFloat($0)/100+"px";
                                });
                            } else if(/^(left|margin(-l|L)eft|padding(-l|L)eft|padding(-t|T)op)$/.test(key)) {
                                val=val.replace(percentReg,function($0) {
                                    return that.parentNode.offsetWidth*parseFloat($0)/100+"px";
                                });
                            }
                        }

                        originStyle[key]=style[key];
                        animationStyle[key]=val;
                    });

                    this._animationStyle=animationStyle;
                    this._originStyle=originStyle;

                    //console.log('new',animationStyle,'original',originStyle);
                });

                anim._step=anim.step;
                anim.step=function(d) {
                    var style,
                        originStyle,
                        originVal,
                        val,
                        newStyle;

                    this.el.each(function() {
                        newStyle={};
                        style=this._animationStyle;
                        originStyle=this._originStyle;

                        for(var key in style) {
                            val=style[key];
                            originVal=originStyle[key];

                            if(key==TRANSFORM) {
                                var m=originVal.match(matrixReg)||['',1,0,0,1,0,0];
                                var i=0;
                                var m2d=getMatrixByTransform(val);

                                m2d.a=getCurrent(m[1],m2d.a,d);
                                m2d.b=getCurrent(m[2],m2d.b,d);
                                m2d.c=getCurrent(m[3],m2d.c,d);
                                m2d.d=getCurrent(m[4],m2d.d,d);
                                m2d.tx=getCurrent(m[5],m2d.tx,d);
                                m2d.ty=getCurrent(m[6],m2d.ty,d);

                                newStyle[key]=m2d.toString();

                            } else if(!isNaN(parseFloat(val))) {
                                originVal=isNaN(parseFloat(originVal))?0:parseFloat(originVal);
                                newStyle[key]=getCurrent(originVal,val,d);
                            }
                        }
                        $(this).css(newStyle);
                        //console.log(this.style.cssText)
                    });

                    anim._step&&anim._step(d);
                }

                anim._finish=anim.finish;
                anim.finish=function() {
                    //console.log('end',this.css)

                    this.el.css(this.css);
                    this._finish&&this._finish(1);
                }
            }
        }

        parallel(animations);
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

    var toTransform=function(css) {
        var result={},
            origTransform,
            m2d;

        $.each(css,function(key,val) {
            if(/matrix|translate|skew|rotate|scale|invert/.test(key)) {
                if(key==='translate') {
                    val=(result[TRANSFORM]||'')+' '+key+'('+val+')';

                } else {
                    if(!m2d) m2d=new Matrix2D();
                    origTransform=(result[TRANSFORM]||'');
                    val=m2d[key=='matrix'?'append':key].apply(m2d,toFloatArr(val.split(','))).toString();
                    val=matrixEndReg.test(origTransform)?origTransform.replace(matrixEndReg,val):(origTransform+' '+val);
                }

                key=TRANSFORM;

            } else if(key==='transform') {
                key=TRANSFORM;
                m2d=null;
            }
            result[key]=val;
        });

        return { css: result,matrix: m2d };
    };

    $.fn.transform=function(css) {
        this.css(toTransform(css).css);

        return this;
    }

    $.fn.matrix=function(matrix) {
        if(matrix instanceof Matrix2D) {
            this.css(TRANSFORM,matrix.toString());

            return this;
        } else
            return getMatrixByTransform(getComputedStyle(this[0],null)[TRANSFORM]);
    };

    var Tween={
        getCurrent: getCurrent,
        parallel: parallelAnimate,
        animate: function(step,duration,ease,finish) {
            var first={
                step: step,
                duration: duration,
                ease: ease,
                finish: finish
            };
            this.parallel([first]);

            return first;
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
