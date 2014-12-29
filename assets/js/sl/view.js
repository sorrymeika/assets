define(function(require,exports,module) {

    var $=require('$'),
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

    var View=sl.Class.extend(function() {
        var that=this,
            options,
            args=slice.call(arguments),
            selector=args.shift();

        if(typeof selector!=='undefined'&&!$.isPlainObject(selector)) {

            that.$el=$(selector);
            options=args.shift();

        } else if(!that.$el) {
            that.$el=$(that.el);
            options=selector;
        }

        if(options&&options.override) {
            var overrideFn;
            $.each(options.override,function(key,fn) {
                overrideFn=that[key];
                (typeof overrideFn!='undefined')&&(that.sealed[key]=overrideFn,fn.sealed=overrideFn);
                that[key]=fn;
            });
            delete options.override;
        }

        that.options=$.extend({},that.options,options);
        that._bindDelegateAttrs=[];
        that._bindAttrs=[];
        that._bindListenTo=[];

        that.el=that.$el[0];
        that.className&&that.$el.addClass(that.className);

        that.listen(that.events);
        that.listen(that.options.events);

        that.initialize.apply(that,args);
        that.options.initialize&&that.options.initialize.apply(that,args);

        that.on('Destory',that.onDestory);

    },{
        $el: null,
        className: null,
        sealed: {},
        options: {},
        events: null,
        _bind: function(el,name,f) {
            this._bindDelegateAttrs.push([el,name,f]);
            this.$el.delegate(el,name,$.proxy(f,this));

            return this;
        },
        _listenEvents: function(events) {
            var that=this;

            events&&$.each(events,function(evt,f) {
                that.listen(evt,f);
            });
        },
        listen: function(evt,f) {
            var that=this;

            if(!f) {
                that._listenEvents(evt);
            }
            else {
                var arr=evt.split(' '),
                    events=arr.shift();

                events=events.replace(/,/g,' ');

                f=$.isFunction(f)?f:that[f];

                if(arr.length>0&&arr[0]!=='') {
                    that._bind(arr.join(' '),events,f);
                } else {
                    that.bind(events,f);
                }
            }

            return that;
        },

        listenTo: function(target) {

            var args=slice.apply(arguments),
                fn=args[args.length-1];

            args[args.length-1]=$.proxy(fn,this);

            !(target instanceof $)&&(target=$(target));

            this._bindListenTo.push(slice.apply(args));
            args.shift();

            $.fn.on.apply(target,args);

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

        bind: function(name,f) {
            this._bindAttrs.push([name,f]);
            this.$el.bind(name,$.proxy(f,this));
            return this;
        },
        unbind: function(name,f) {
            var that=this,
                $el=that.$el;

            for(var i=that._bindAttrs.length-1,attrs;i>=0;i--) {
                attrs=that._bindAttrs[i];

                if(attrs[0]==name&&(typeof f==='undefined'||f===attrs[1])) {
                    $el.unbind.apply($el,attrs);
                    that._bindAttrs.splice(i,1);
                }
            }

            return this;
        },

        initialize: function() {
        },

        onDestory: function() { },

        destory: function() {
            var $el=this.$el,
                that=this,
                target;

            $.each(this._bindDelegateAttrs,function(i,attrs) {
                $.fn.undelegate.apply($el,attrs);
            });

            $.each(this._bindListenTo,function(i,attrs) {
                target=attrs.shift();
                target.off.apply(target,attrs);
            });

            $.each(that._bindAttrs,function(i,attrs) {
                $.fn.unbind.apply($el,attrs);
            });
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