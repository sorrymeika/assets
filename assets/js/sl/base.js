define(function(require,exports,module) {

    var Class=function() {
        var that=this,
            args=Array.prototype.slice.call(arguments),
            options=args.shift();

        if(options) {
            for(var i in options) {
                that.options[i]=options[i];
            }
        }
        that.initialize.apply(that,args);
        that.options.initialize&&that.options.initialize.apply(that,args);
    };

    Class.fn=Class.prototype={
        options: {},
        initialize: function() { }
    };

    Class.extend=function(childClass,prop) {
        var that=this,
            F=function() { },
            options=that.fn.options;

        childClass=typeof childClass=='function'?childClass:(prop=childClass,function() {
            that.apply(this,arguments);
        });

        F.prototype=that.fn;
        childClass.fn=childClass.prototype=new F();

        if(!prop.options) prop.options={};
        for(var i in options) {
            prop.options[i]=options[i];
        }

        for(var i in prop) {
            childClass.fn[i]=prop[i];
        }

        childClass.superClass=that.fn;
        childClass.fn.constructor=childClass;

        childClass.extend=arguments.callee;

        return childClass;
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
            window.requestAnimationFrame=function(callback,element) {
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

    module.exports={
        noop: function() { },
        Class: Class
    };
});