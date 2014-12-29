define(['$','util','bridge','./tmpl','./view','./widget/scroll','./plugins/template','sl/widget/tip','sl/widget/dialog'],function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        app=require('bridge'),
        sl=require('./base'),
        tmpl=require('./tmpl'),
        view=require('./view'),
        Scroll=require('./widget/scroll'),
        templatePlugin=require('./plugins/template');

    var Dialog=require('sl/widget/dialog');

    require('sl/widget/tip');

    var noop=util.noop,
        indexOf=util.indexOf,
        slice=Array.prototype.slice,
        getUrlPath=function(url) {
            var index=url.indexOf('?');
            if(index!= -1) {
                url=url.substr(0,index);
            }
            return url.toLowerCase();
        };

    var Activity=view.extend({
        plugins: [templatePlugin],
        options: {
            route: null
        },
        useAnimation: true,
        animationName: null,
        application: null,
        el: '<div class="view"></div>',

        _setRoute: function(route) {
            this.route=route;
            this.hash=route.hash;
            this.url=route.url;
            this._queries=this.queries;
            this.queries=$.extend({},route.queries);
        },

        queryString: function(key,val) {
            if(typeof val==='undefined')
                return this.route.queries;

            else if(typeof val===null||typeof val===false||typeof val==='')
                delete this.route.queries[key];
            else
                this.route.queries[key]=val||'';

            var queries=$.param(this.route.queries);
            this.application.to(this.route.url+(queries?'?'+queries:''));
        },

        initialize: function() {
            var that=this;

            that.className&&that.$el.addClass(that.className);
            that.className=that.el.className;

            that._setRoute(that.options.route);

            that.application=that.options.application;

            that.on('Start',that.onStart);
            that.on('Resume',that.onResume);
            that.on('Show',that.onShow);
            that.on('Pause',that.onPause);
            that.on('QueryChange',that.onQueryChange);
            that.on('QueryChange',that._handleQueryActions);

            that._dfd=$.when(that.options.templateEnabled&&that.initWithTemplate())
                .then(function() {
                    that.$('.main,.scroll').each(function() {
                        new Scroll(this);
                    });
                })
                .then($.proxy(that.onCreate,that))
                .then(function() {
                    that.trigger('Start');
                });
        },
        onCreate: noop,
        onStart: noop,
        onResume: noop,

        //进入动画结束时触发
        onShow: noop,

        onStop: noop,
        onRestart: noop,

        //离开动画结束时触发
        onPause: noop,

        onQueryChange: noop,

        then: function(fn) {
            this._dfd=this._dfd.then($.proxy(fn,this));
            return this;
        },

        wait: function() {
            var dfd=$.Deferred();

            this._dfd=this._dfd.then(function() {
                return dfd;
            });

            return dfd;
        },

        _queryActions: {},
        _handleQueryActions: function() {
            var that=this;
            var queries=this.queries;
            var prevQueries=this._queries;
            var action;

            $.each(this._queryActions,function(i,qa) {
                action=queries[i];

                if(action!=prevQueries[i]) {
                    var fn=qa.map[action];

                    fn.call(qa.cls)
                }
            });
        },

        bindQueryAction: function(name,cls,fnMap) {
            var map={};
            var that=this;
            var newFn;

            $.each(fnMap,function(i,fn) {
                newFn=function() {
                    that.queryString(name,fn);
                };
                newFn.__query_action=cls[fn];
                cls[fn]=newFn;
            });


            this._queryActions[name]={
                cls: cls,
                map: fnMap
            };
            return this;
        },

        createDialog: function(options) {
            var that=this;
            var dialog=new Dialog(options);

            that.bindQueryAction('dialog',dialog,{
                show: 'show',
                "": 'hide'
            });

            return dialog;
        },

        listenResult: function(event,fn) {
            this.listenTo(this.application,event,fn);
        },

        setResult: function() {
            var args=slice.call(arguments);
            this.application.trigger.apply(this.application,args);
        },

        isPrepareExitAnimation: false,
        prepareExitAnimation: function() {
            if(this.isPrepareExitAnimation) return;
            this.isPrepareExitAnimation=true;

            var that=this;

            //that.$('header,footer').css({ position: 'absolute' });

            if(!that.useAnimation) { }
            that.application.mask.show();
        },

        finishEnterAnimation: function() {
            var that=this;

            that.$el.addClass('active');

            that.application.mask.hide();

            that.isPrepareExitAnimation=false;
            that.then(function() {
                that.trigger('Show');
            });
        },

        compareUrl: function(url) {
            return getUrlPath(url)===this.route.url.toLowerCase();
        },

        //onShow后才可调用
        redirect: function(url) {
            var that=this,
                application=that.application;

            application._getOrCreateActivity(url,function(activity,route) {
                activity.el.className=activity.className+' active';
                application.$el.append(activity.$el);
                application._currentActivity=activity;
                that.$el.remove();
                that.trigger('Pause');

                activity.then(function() {
                    activity.trigger('Resume');
                    activity.trigger('Show');
                });
            });
        },

        _transitionTime: app.ios&&parseFloat(app.osVersion)<7?function(time) {
            this.el.style.webkitTransition="all "+(time||0)+'ms ease-out 0ms';
        } :function(time) {
            this.el.style.webkitTransitionDuration=(time||0)+'ms';
        },

        _animationFrom: function(name,type) {
            this.el.className=this.className+' '+(name?name+'-':'')+type;
        },

        _animationTo: function(name,type) {
            this.$el.addClass((name?name+'-':'')+type);
        },

        _to: function(url,duration,animationName,type,callback) {
            if(!duration) duration=400;

            console.log(url);

            var that=this,
                application=that.application;

            if(url.toLowerCase()!=location.hash.replace(/^#/,'').toLowerCase()) {
                application.navigate(url);
            }

            application._getOrCreateActivity(url,function(activity,route) {
                animationName=animationName||(type=='open'?activity:that).animationName;

                if(activity.route.hash!=route.hash) {
                    activity._setRoute(route);
                    activity.trigger('QueryChange');
                }
                if(activity.url==that.url) {
                    application.turning();
                    return;
                }

                application.siblings(route.url,that.url);
                application._currentActivity=activity;

                that.prepareExitAnimation();

                activity.el.parentNode===null&&activity.$el.appendTo(application.$el);

                activity.then(function() {
                    activity.trigger('Resume');
                });

                if(that.useAnimation) {
                    activity._animationFrom(animationName,type+'_enter_animation-from');
                    that._animationFrom(animationName,type+'_exit_animation-from');
                    that.el.clientHeight;

                    that._transitionTime(duration);
                    activity._transitionTime(duration);

                    var timer;
                    var isExecuted=false;
                    var $els=$(activity.$el);
                    var end=function() {
                        if(isExecuted) return;
                        isExecuted=true;
                        timer&&clearTimeout(timer);
                        that._transitionTime(0);
                        activity._transitionTime(0);

                        callback&&callback(activity);
                        activity.finishEnterAnimation();
                    };
                    $els.one($.fx.transitionEnd,end);

                    that._animationTo(animationName,type+'_exit_animation-to');
                    activity._animationTo(animationName,type+'_enter_animation-to');
                    timer=setTimeout(end,duration);

                } else {
                    callback&&callback(activity);
                    activity.finishEnterAnimation();
                }
            });
        },

        _forwardImmediately: function(url,duration,animationName) {
            var that=this;
            that._to(url,duration,animationName,'open',function() {
                that.trigger('Pause');
            });
        },

        forward: function() {
            this.application.queue.apply(this.application,[this,this._forwardImmediately].concat(slice.call(arguments)));
        },

        _backImmediately: function(url,duration,animationName) {
            var that=this;

            if(typeof url!=='string') {
                that.prepareExitAnimation();
                that.application.back();

            } else {
                if(typeof duration==='string') {
                    animationName=duration;
                    duration=null;
                }

                that._to(url,duration,animationName,'close',function() {
                    that.destory();
                });
            }
        },

        back: function() {
            this.application.queue.apply(this.application,[this,this._backImmediately].concat(slice.call(arguments)));
        },

        finish: function() {
            this.destory();
        },

        destory: function() {
            this.application.remove(this.url);
            view.fn.destory.apply(this,arguments);
        }
    });

    sl.Activity=Activity;

    return Activity;
});
