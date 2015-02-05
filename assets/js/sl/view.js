define(function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        sl=require('./base'),
        Event=require('./event'),
        tmpl=require('./tmpl'),
        slice=Array.prototype.slice,

        plugin=function(host,options) {
            var obj,
            original,
            type,
            override=options.override,
            prototype=host.prototype;

            for(var i in options) {
                obj=options[i];

                if(i==='override'||typeof obj==='undefined') continue;

                original=prototype[i];
                type=typeof original;

                if(type==='undefined') {
                    prototype[i]=obj;

                } else if(type==='function') {
                    prototype[i]=(function(key,fn) {

                        return function() {
                            this._pluginFnCursorRecords[key]=fn;
                            fn.apply(this,arguments);
                        };

                    })(i,obj);

                    obj.__host=original;

                } else if($.isPlainObject(original)) {
                    $.extend(true,prototype[i],obj);
                } else {
                    prototype[i]=obj;
                }
            }

            if(override)
                for(var i in override) {
                    prototype[i]=override[i];
                }
        };

    var viewOptions=['className','el'];
    var View=sl.Class.extend(function() {
        var that=this,
            options,
            args=slice.call(arguments),
            selector=args.shift();

        that._bindListenTo=[];

        $.isPlainObject(selector)?(options=selector,selector=null):(options=args.shift());

        if(options&&options.override) {
            $.each(options.override,function(key,fn) {
                that[key]=fn;
            });
            delete options.override;
        }
        that.options=$.extend({},that.options,options);

        $.extend(this,util.pick(that.options,viewOptions))

        that.cid=util.guid();

        that.setElement(selector||that.el);

        that.initialize.apply(that,args);
        that.options.initialize&&that.options.initialize.apply(that,args);

        that.on('Destory',that.onDestory);

    },{
        options: {},
        setElement: function(element,delegate) {
            if(this.$el) this.undelegateEvents();
            this.$el=$(element);
            this.el=this.$el[0];
            this.className&&this.$el.addClass(this.className);
            if(delegate!==false) this.delegateEvents();
            return this;
        },

        undelegateEvents: function() {
            this.$el.off('.delegateEvents'+this.cid);
            return this;
        },

        delegateEvents: function() {
            this.listen(this.events);
            this.listen(this.options.events);
            return this;
        },

        listen: function(options,fn) {
            var that=this;

            if(!fn) {
                for(var k in options) {
                    that.listen(k,options[k]);
                }
            } else {
                var els=options.split(' '),
                    events=els.shift().replace(/,/g,'.delegateEvents'+that.cid+' ');

                fn=$.proxy($.isFunction(fn)?fn:that[fn],that);

                if(els.length>0&&els[0]!=='') {
                    that.$el.on(events,els.join(' '),fn);
                } else {
                    that.$el.on(events,fn);
                }
            }

            return that;
        },

        listenTo: function(target) {

            var args=slice.apply(arguments),
                fn=args[args.length-1];

            args[args.length-1]=$.proxy(fn,this);

            typeof target.on!=='function'&&(target=$(target));

            this._bindListenTo.push(slice.apply(args));
            args.shift();

            target.on.apply(target,args);

            return this;
        },

        on: Event.on,
        one: Event.one,
        off: Event.off,
        trigger: Event.trigger,

        _pluginFnCursorRecords: {},
        host: function() {
            var args=slice.call(arguments),
                fn=args.shift();

            this._pluginFnCursorRecords[fn].__host.apply(this,args);
        },

        $: function(selector) {
            if(typeof selector==="string"&&selector[0]=='#') {
                selector='[id="'+selector.substr(1)+'"]';
            }
            return $(selector,this.$el);
        },

        initialize: function() {
        },

        onDestory: function() { },

        destory: function() {
            var $el=this.$el,
                that=this,
                target;

            $.each(this._bindListenTo,function(i,attrs) {
                target=attrs.shift();
                target.off.apply(target,attrs);
            });

            that.undelegateEvents();
            that.$el.remove();

            that.trigger('Destory');
        }
    });

    View.extend=function(childClass,prop) {
        var that=this;

        var plugins=(typeof prop!=='undefined'?prop:childClass).plugins;

        childClass=sl.Class.extend.call(that,childClass,prop);

        childClass.events=$.extend({},childClass.superClass.events,childClass.prototype.events);

        childClass.extend=arguments.callee;
        childClass.loadPlugins=that.loadPlugins;

        plugins&&childClass.loadPlugins(plugins);

        return childClass;
    };


    View.loadPlugins=function(plugins) {
        var that=this,
            item;

        for(var i=0,n=plugins.length;i<n;i++) {
            item=plugins[i];

            if(typeof item==='function') {
                item(that);
            } else {
                plugin(that,item);
            }
        }
    };

    View.Plugin=function(options) {

        return function(host) {
            plugin(host,options);
        }
    };

    sl.View=View;

    module.exports=View;
});