define(['$','util','bridge','./activity','./tmpl','./view','./plugins/template','./tween','./animations'],function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('./base'),
        tmpl=require('./tmpl'),
        view=require('./view'),
        tween=require('./tween'),
        animations=require('./animations'),
        Activity=require('./activity'),
        plugin=require('./plugins/template');

    var noop=util.noop,
        lastIndexOf=util.lastIndexOf,
        slice=Array.prototype.slice,
        getUrlPath=util.getUrlPath,
        hashToUrl=function(hash) {
            return (hash.replace(/^#/,'')||'/').toLowerCase();
        };

    var Application=view.extend({
        events: {
            'tap,click a[href]:not(.js-link-default)': function(e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('href'))) {
                    e.preventDefault();
                    if(e.type=='tap') {
                        var href=target.attr('href');
                        if(!/^#/.test(href)) href='#'+href;
                        target.attr('forward')!=null?that.forward(href):target.attr('back')!=null?that.back(href):that.to(href);
                    }

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            },
            'tap [data-href]': function(e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('data-href'))) {
                    that.to(target.attr('data-href'));
                }
            },
            'tap [data-back]': function(e) {
                this.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function(e) {
                this.forward($(e.currentTarget).attr('data-forward'));
            },
            //            'touchmove': function(e) {
            //                e.preventDefault();
            //                return false;
            //            },
            'focus input': function(e) {
                this.activeInput=e.target;
            }
        },

        el: '<div class="viewport"></div>',

        routes: [],
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
                queries={},
                hash=hashToUrl(url);

            url=hash;

            var index=url.indexOf('?');
            var query;
            if(index!= -1) {
                query=url.substr(index+1);

                url=url.substr(0,index);

                query.replace(/(?:^|&)([^=&]+)=([^&]*)/g,function(r0,r1,r2) {
                    queries[r1]=decodeURIComponent(r2);
                    return '';
                })
            } else {
                query='';
            }

            $.each(this.routes,function(i,route) {
                var m=route.reg?url.match(route.reg):null;

                if(m) {
                    result={
                        path: m[0],
                        url: hash,
                        hash: '#'+hash,
                        view: route.view,
                        data: {},
                        queryString: query,
                        queries: queries
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

            that.mask=$('<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div>').on('tap click touchend touchmove touchstart',function(e) {
                e.preventDefault();
            }).appendTo(document.body);
        },

        skip: 0,
        _history: [],
        _historyCursor: -1,
        _currentActivity: null,

        _queue: [],

        queue: function(context,fn) {
            var queue=this._queue;
            var args=slice.call(arguments,2);
            queue.push(context,fn,args);

            if(queue.length===3)
                fn.apply(context,args);
        },

        turning: function() {
            var that=this;
            var queue=that._queue;

            if(queue.length>=3) {
                queue.splice(0,3);
                if(queue.length) {
                    queue[1].apply(queue[0],queue[2]);
                }
            }
        },

        start: function() {
            sl.app=this;

            util.style(bridge.android?'header,footer{position:absolute}':'header,footer{position:fixed}.viewport .view.active{-webkit-transform:none}');

            var that=this;
            var hash;
            var $win=$(window);

            if(!location.hash) location.hash='/';
            that.hash=hash=hashToUrl(location.hash);

            that.queue(that,that._getActivity,hash,function(activity) {

                that._currentActivity=activity;
                that._history.push(activity.url);
                that._historyCursor++;

                activity.$el.transform(activity.animation.openEnterAnimationTo).appendTo(that.$el);
                activity.then(function() {
                    activity.trigger('Resume');
                    activity.trigger('Show');
                    that.turning();
                });

                $win.on('hashchange',function() {
                    hash=that.hash=hashToUrl(location.hash);

                    var index=lastIndexOf(that._history,hash),
                        isForward=(that._skipRecordHistory||index== -1)&&!that.isHistoryBack;

                    if(that._skipRecordHistory!==true) {
                        if(index== -1) {
                            that.isHistoryBack?that._history.splice(that._historyCursor,0,hash):(that._history.push(hash),that._historyCursor++);
                        } else {
                            that._history.length=index+1;
                            that._historyCursor=index;
                        }
                    } else
                        that._skipRecordHistory=false;

                    if(that.skip==0) {
                        that[isForward?'forward':'back'](hash);

                    } else if(that.skip>0)
                        that.skip--;
                    else
                        that.skip=0;

                    that.isHistoryBack=false;
                });
            });

            that.$el.appendTo(document.body);
        },

        _to: function(url) {
            this._navigate(url);
            this.turning();
        },

        to: function(url) {
            this.queue(this,this._to,url);
        },

        _navigate: function(url) {
            url=hashToUrl(url);

            var that=this,
                index=lastIndexOf(that._history,url);

            if(index== -1) {
                that._history.splice(that._historyCursor+1,0,url);
                that._history.length=that._historyCursor+2;
                that._historyCursor++;
                that._skipRecordHistory=true;
                location.hash=url;

            } else if(index!=that._historyCursor) {
                history.go(index-that._historyCursor);
            }
        },

        navigate: function(url) {
            this.skip++;
            this._navigate(url);
        },

        _activities: {},

        get: function(url) {
            return this._activities[getUrlPath(url)];
        },

        set: function(url,activity) {
            this._activities[getUrlPath(url)]=activity;
        },

        remove: function(url) {
            this._activities[getUrlPath(url)]=undefined;
        },

        viewPath: 'views/',

        _forward: function(url,duration,animationName) {
            var currentActivity=this._currentActivity;

            this._animationTo(url,duration,animationName,'open',function() {
                currentActivity.trigger('Pause');
            });
        },

        forward: function(url,duration,animationName) {
            this.queue(this,this._forward,url,duration,animationName);
        },

        isHistoryBack: false,

        _back: function(url,duration,animationName) {
            var that=this,
                currentActivity=that._currentActivity;

            if(typeof url!=='string') {
                currentActivity.prepareExitAnimation();
                that.isHistoryBack=true;
                history.back();
                that.turning();

            } else {
                if(typeof duration==='string') {
                    animationName=duration;
                    duration=null;
                }
                that._animationTo(url,duration,animationName,'close',function() {
                    currentActivity.destory();
                });
            }
        },

        back: function(url,duration,animationName) {
            this.queue(this,this._back,url,duration,animationName);
        },

        _getActivity: function(url,callback) {
            var that=this,
                route=typeof url==='string'?that.matchRoute(url):url;

            if(!route) return;

            var activity=that.get(route.path);

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function(ActivityClass) {

                    if(ActivityClass!=null) {
                        activity=new ActivityClass({
                            application: that,
                            route: route
                        });
                        that.set(route.path,activity);

                        activity.then(function() {
                            callback.call(that,activity,route);
                        });

                    } else {
                        that.skip++;
                        that._currentActivity.finishEnterAnimation();
                        history.back();
                    }
                });

            } else {
                callback.call(that,activity,route);
            }
        },

        _animationTo: function(url,duration,animationName,type,callback) {
            if(!duration) duration=400;
            url=hashToUrl(url);

            var application=this,
                currentActivity=application._currentActivity,
                route=application.matchRoute(url);

            if(url!=hashToUrl(location.hash)&&application._queue.length==3&&hashToUrl(application._queue[2][0])===url) {
                application.navigate(url);
            }

            if(currentActivity.path==route.path) {
                checkQueryString(currentActivity,route);
                application.turning();
                return;
            }

            application._getActivity(route,function(activity) {
                if(!animationName) animationName=(type=='open'?activity:currentActivity).animationName;

                if(activity.path==currentActivity.path) {
                    checkQueryString(activity,route);
                    application.turning();
                    return;
                }

                application.$el.children(':not([data-path="'+currentActivity.path+'"])').filter(':not([data-path="'+route.path+'"])').addClass('stop')[0];
                application._currentActivity=activity;

                currentActivity.prepareExitAnimation();

                activity.el.parentNode===null&&activity.$el.appendTo(application.$el);

                activity.then(function() {
                    activity.trigger('Resume');
                });

                var anim=animations[animationName],
                    ease=type=='open'?'ease-out':'ease-out';

                /*
                console.log(type,$.extend({
                zIndex: type=='open'?2:1
                },anim[type+'EnterAnimationFrom']),$.extend({
                zIndex: type=='open'?1:3
                },anim[type+'ExitAnimationFrom']))
                */

                tween.parallel([{
                    el: activity.el,
                    start: $.extend({
                        zIndex: type=='open'?2:1
                    },anim[type+'EnterAnimationFrom']),
                    css: anim[type+'EnterAnimationTo'],
                    duration: duration,
                    ease: ease
                },{
                    el: currentActivity.el,
                    start: $.extend({
                        zIndex: type=='open'?1:3
                    },anim[type+'ExitAnimationFrom']),
                    css: anim[type+'ExitAnimationTo'],
                    duration: duration,
                    ease: ease,
                    finish: function() {
                        callback&&callback(activity);
                        activity.finishEnterAnimation();
                        application.turning();
                    }
                }]);
            });
        }

    });

    sl.Application=Application;

    return Application;
});
