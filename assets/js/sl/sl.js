define('sl/sl',['$','util','app','./tmpl','./view','./plugins/template'],function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        app=require('app'),
        sl=require('./base'),
        tmpl=require('./tmpl'),
        view=require('./view'),
        plugin=require('./plugins/template');

    var noop=function() { },
        indexOf=function(array,key,compareItem) {
            if(typeof compareItem==='undefined') {
                compareItem=key;
                key=null;
            };
            var result= -1,
                value;
            $.each(array,function(i,item) {
                value=key!==null?item[key]:item;

                if(compareItem===value) {
                    result=i;
                    return false;
                }
            });
            return result;
        },
        lastIndexOf=function(array,key,compareItem) {
            if(typeof compareItem==='undefined') {
                compareItem=key;
                key=null;
            };
            var result= -1,
                value;

            for(var i=array.length-1;i>=0;i--) {
                var item=array[i];
                value=key!==null?item[key]:item;

                if(compareItem===value) {
                    result=i;
                    break;
                }
            }

            return result;
        },
        slice=Array.prototype.slice,
        record=(function() {
            var data={},
                id=0,
                ikey='_gid';    // internal key.

            return function(obj,key,val) {
                var dkey=obj[ikey]||(obj[ikey]= ++id),
                    store=data[dkey]||(data[dkey]={});

                val!==undefined&&(store[key]=val);
                val===null&&delete store[key];

                return store[key];
            };
        })(),
        simplelize=function(Class,defaultFunc) {

            return function() {
                var one=Class._static,
                args=slice.apply(arguments);

                if(!one) one=Class._static=new Class();

                if(!args.length) return one;

                var actionName=args.shift()+'',
                action;

                $.each(one,function(name,val) {
                    if(name==actionName) {
                        action=val;
                        return false;
                    }
                });

                if($.isFunction(action)) {
                    action.apply(one,args);
                } else {
                    defaultFunc&&defaultFunc.call(one,actionName);
                }
                return this;
            }
        },
        zeptolize=function(name,Class) {
            var key=name.substring(0,1).toLowerCase()+name.substring(1),
            old=$.fn[key];

            $.fn[key]=function(opts) {
                var args=slice.call(arguments,1),
                method=typeof opts==='string'&&opts,
                ret,
                obj;

                $.each(this,function(i,el) {

                    // 从缓存中取，没有则创建一个
                    obj=record(el,name)||record(el,name,new Class(el,$.isPlainObject(opts)?opts:undefined));

                    // 取实例
                    if(method==='this') {
                        ret=obj;
                        return false;    // 断开each循环
                    } else if(method) {

                        // 当取的方法不存在时，抛出错误信息
                        if(!$.isFunction(obj[method])) {
                            throw new Error('组件没有此方法：'+method);
                        }

                        ret=obj[method].apply(obj,args);

                        // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                        if(ret!==undefined&&ret!==obj) {
                            return false;
                        }

                        // ret为obj时为无效值，为了不影响后面的返回
                        ret=undefined;
                    }
                });

                return ret!==undefined?ret:this;
            };

            $.fn[key].noConflict=function() {
                $.fn[key]=old;
                return this;
            };
        };

    var ApplicationNew=view.extend({
        routes: [],
        el: '<div class="viewport"></div>',
        mapRoute: function(options) {
            var routes=this.routes;
            $.each(options,function(k,opt) {
                var parts=[],
                    routeOpt={};

                var reg='^(?:\/{0,1})'+k.replace(/(\/|^|\?){([^\/\?]+)}/g,function(r0,r1,r2) {
                    var ra=r2.split(':');

                    if(ra.length>1) {
                        parts.push(ra.shift());
                        r2=ra.join(':');
                    }

                    return r1.replace('?','\\?*')+'('+r2+')';
                })+'$';

                routeOpt={
                    reg: new RegExp(reg),
                    parts: parts
                };
                if(typeof opt==='string') {
                    routeOpt.view=opt;
                } else {
                    routeOpt.view=opt.view;
                }
                routes.push(routeOpt);
            });
        },
        matchRoute: function(url) {
            var result=null,
                queries={};

            var index=url.indexOf('?');
            if(index!= -1) {
                var query=url.substr(index+1);

                url=url.substr(0,index);

                query.replace(/(?:^|&)([^=&]+)=([^=&]*)/g,function(r0,r1,r2) {
                    queries[r1]=decodeURIComponent(r2);
                    return '';
                })
            }

            $.each(this.routes,function(i,route) {
                var m=route.reg?url.match(route.reg):null;

                if(m) {
                    result={
                        url: m[0],
                        view: route.view,
                        data: {},
                        query: queries
                    };
                    $.each(route.parts,function(i,name) {
                        result.data[name]=m[i+1];
                    });
                    return false;
                }
            });

            return result;
        },
        initialize: function() {
            var that=this;
        },
        _activities: {},

        get: function(url) {
            return this._activities[url];
        },

        set: function(url,activity) {
            this._activities[url]=activity;
        },

        viewPath: 'views/',

        _openActivity: function(url,callback) {
            var that=this,
                route=that.matchRoute(location.hash),
                activity=that.get(route.url);

            console.log(route);

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function(ActivityClass) {
                    activity=new ActivityClass({
                        application: that,
                        route: route
                    });
                    callback.call(that,activity);
                });

            } else {
                callback.call(that,activity);
            }
        },

        start: function() {
            var that=this;

            that._openActivity(location.hash,function(activity) {
                activity.$el.appendTo(that.$el);

            });

            that.$el.appendTo(document.body);
        }
    });

    var ActivityNew=view.extend({
        options: {
            route: null
        },
        useAnimation: !/Android\s2/.test(navigator.userAgent),
        application: null,
        el: '<div class="view"></div>',
        initialize: function() {
            var that=this;

            that.route=that.options.route;
            that.url=that.route.url;
            that.application=that.options.application;

            that.bind('Start',that.onStart);
            that.bind('Resume',that.onResume);
            that.bind('Pause',that.onPause);
            that.bind('Destory',that.onDestory);

            that.options.templateEnabled&&that.initWithTemplate();

            $.when($.proxy(that.onCreate,that))
                .then(function() {
                    that.trigger('Start');
                    that.trigger('Resume');
                });
        },
        onCreate: noop,
        onStart: noop,
        onResume: noop,
        onStop: noop,
        onRestart: noop,
        onPause: noop,
        back: function(url,enterAnimation,exitAnimation) {
            var that=this;

            if(that.useAnimation) {

            } else {
                that.finish();
            }
        },
        forword: function(url,enterAnimation,exitAnimation) {
            var that=this,
                application=that.application;

            that.trigger('Pause');

            application._openActivity(url,function(activity) {

                activity.$el.appendTo(application.$el);

                if(that.useAnimation) {

                } else {
                }
            });


        },
        to: function() {
            this.forword.apply(this,arguments);
        },
        finish: function() {
            this.destory();
        }
    });

    plugin(ActivityNew);

    var Tip=function(text) {
        this._tip=$('<div class="tip" style="display:none">'+(text||'')+'</div>').appendTo('body');
    };

    Tip.prototype={
        _hideTimer: null,
        _clearHideTimer: function() {
            var me=this;
            if(me._hideTimer) {
                clearTimeout(me._hideTimer);
                me._hideTimer=null;
            }
        },
        _visible: false,
        show: function(msec) {

            var me=this,
                tip=me._tip;

            me._clearHideTimer();

            if(msec)
                me._hideTimer=setTimeout(function() {
                    me._hideTimer=null;
                    me.hide();
                },msec);

            if(me._visible) {
                return;
            }
            me._visible=true;

            tip.css({
                '-webkit-transform': 'scale(0.2,0.2)',
                display: 'block',
                visibility: 'visible',
                opacity: 0
            }).animate({
                scale: "1,1",
                opacity: 0.9
            },200,'ease-out');

            return me;
        },
        hide: function() {
            var me=this,
                tip=me._tip;

            if(!me._visible) {
                return;
            }
            me._visible=false;

            tip.animate({
                scale: ".2,.2",
                opacity: 0
            },200,'ease-in',function() {
                tip.hide().css({
                    '-webkit-transform': 'scale(1,1)'
                })
            });

            me._clearHideTimer();
            return me;
        },
        text: function(msg) {
            var me=this,
                tip=me._tip;

            tip.html(msg).css({
                '-webkit-transform': 'scale(1,1)',
                '-webkit-transition': ''
            });

            if(tip.css('display')=='none') {
                tip.css({
                    visibility: 'hidden',
                    display: 'block',
                    marginLeft: -1000
                });
            }

            tip.css({
                marginTop: -1*tip.height()/2,
                marginLeft: -1*tip.width()/2
            });
            return me;
        }
    };


    $.extend(sl,{
        Application: ApplicationNew,
        Activity: ActivityNew,
        indexOf: indexOf,
        lastIndexOf: lastIndexOf,
        tip: simplelize(Tip,function(actionName) {
            this.text(actionName).show(3000);
        }),
        common: {},
        zeptolize: zeptolize,
        simplelize: simplelize
    });

    module.exports=sl;
});
