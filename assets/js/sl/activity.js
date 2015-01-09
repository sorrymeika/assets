﻿define(['$','util','bridge','./tmpl','./view','./widget/scroll','./plugins/template','sl/widget/tip','sl/widget/dialog','extend/ortchange'],function(require,exports,module) {

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
    require('extend/ortchange');

    var noop=util.noop,
        indexOf=util.indexOf,
        slice=Array.prototype.slice,
        getUrlPath=util.getUrlPath,
        hashToUrl=function(hash) {
            return (hash.replace(/^#/,'')||'/').toLowerCase();
        };

    var checkQueryString=function(activity,route) {
        if(activity.route.hash!=route.hash) {
            activity._setRoute(route);
            activity.trigger('QueryChange');
        }
    };

    var Activity=view.extend({
        plugins: [templatePlugin],
        options: {
            route: null
        },
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
                return this.route.queries[key];

            else if(val===null||val===false||val==='')
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
            that._scrolls=[];

            that._dfd=$.when(that.options.templateEnabled&&that.initWithTemplate())
                .then(function() {
                    that.$('.main,.scroll').each(function() {
                        that._scrolls.push(new Scroll(this));
                    });
                })
                .then($.proxy(that.onCreate,that))
                .then(function() {
                    that.trigger('Start');
                    that._handleQueryActions();
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
            var queries=that.queries;
            var prevQueries=that._queries;
            var queryActions=that._queryActions;
            var action;

            queryActions&&$.each(queryActions,function(i,qa) {
                action=queries[i]||'';

                if((action&&!prevQueries)||(prevQueries&&action!=prevQueries[i])) {
                    var queryFn=qa.cls[qa.map[action]].__query_action;
                    queryFn.apply(qa.cls,queryFn.__arguments);
                    queryFn.__arguments=undefined;
                }
            });
        },

        bindQueryAction: function(name,cls,fnMap) {
            var map={};
            var that=this;
            var newFn;

            $.each(fnMap,function(i,fn) {
                newFn=function() {
                    var args=slice.apply(arguments);
                    var queryFn=arguments.callee.__query_action;
                    (that.queryString(name)==i)?queryFn.apply(cls,args):(queryFn.__arguments=args,that.queryString(name,i));
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

        prompt: function(title,val,fn,target) {
            target=typeof fn!=='function'?fn:target;
            fn=typeof val==='function'?val:fn;
            val=typeof val==='function'?'':val;

            !this._prompt&&(this._prompt=this.createDialog({
                content: '<input type="text" class="prompt-text" />',
                buttons: [{
                    text: '取消',
                    click: function() {
                        this.hide();
                    }
                },{
                    text: '确认',
                    click: function() {
                        this.hide();
                        this.ok&&this.ok(this.$('.prompt-text').val());
                    }
                }]
            }));

            var prompt=this._prompt;

            prompt.title(title||'请输入').show(target);
            prompt.$('.prompt-text').val(val).focus();
            prompt.ok=$.proxy(fn,this);
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

        onActivityResult: function(event,fn) {
            this.listenTo(this.application,event,fn);
        },

        setResult: function() {
            this.application.trigger.apply(this.application,arguments);
        },

        isPrepareExitAnimation: false,
        prepareExitAnimation: function() {
            var that=this;
            if(that.isPrepareExitAnimation) return;
            var application=that.application;
            that.isPrepareExitAnimation=true;
            if(application.currentInput) {
                application.currentInput.blur();
                application.currentInput=null;
            }
            application.mask.show();
        },

        finishEnterAnimation: function() {
            var that=this;
            that.application.mask.hide();

            that.isPrepareExitAnimation=false;
            that.then(function() {
                that.$el.addClass('active');
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
            this.el.style.webkitTransition="all "+(time||0)+'ms ease 0ms';
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
            url=hashToUrl(url);

            var that=this,
                application=that.application;

            if(url!=hashToUrl(location.hash)) {
                application.navigate(url);
            }

            var currentActivity=application._currentActivity;
            var route=application.matchRoute(url);

            if(currentActivity.url==url) {
                checkQueryString(currentActivity,route);
                application.turning();
                return;
            }

            application._getOrCreateActivity(route,function(activity) {
                animationName=animationName||(type=='open'?activity:that).animationName;

                if(activity.url==that.url) {
                    checkQueryString(activity,route);
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

                activity._animationFrom(animationName,type+'_enter_animation-from');
                that._animationFrom(animationName,type+'_exit_animation-from');
                that.el.clientHeight;

                that._transitionTime(duration);
                activity._transitionTime(duration);

                var timer;
                var isExecuted=false;
                var $els=$(activity.$el).add(that.$el);
                var end=function() {
                    if(isExecuted) return;
                    isExecuted=true;
                    timer&&clearTimeout(timer);

                    that._transitionTime(0);
                    activity._transitionTime(0);

                    callback&&callback(activity);
                    activity.finishEnterAnimation();
                    application.turning();
                };
                $els.one($.fx.transitionEnd,end);

                that._animationTo(animationName,type+'_exit_animation-to');
                activity._animationTo(animationName,type+'_enter_animation-to');
                timer=setTimeout(end,duration);
            });
        },

        _forward: function(url,duration,animationName) {
            var that=this;
            that._to(url,duration,animationName,'open',function() {
                that.trigger('Pause');
            });
        },

        forward: function(url,duration,animationName) {
            this.application.queue(this,this._forward,url,duration,animationName);
        },

        _back: function(url,duration,animationName) {
            var that=this;

            if(typeof url!=='string') {
                that.prepareExitAnimation();
                that.application.back();
                that.application.turning();

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

        back: function(url,duration,animationName) {
            this.application.queue(this,this._back,url,duration,animationName);
        },

        finish: function() {
            this.destory();
        },

        destory: function() {
            $.each(this._scrolls,function(i,scroll) {
                scroll.destory();
            });
            this.application.remove(this.url);
            view.fn.destory.apply(this,slice.apply(arguments));
        }
    });

    sl.Activity=Activity;

    return Activity;
});
