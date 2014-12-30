define(['$','util','bridge','./activity','./tmpl','./view','./plugins/template'],function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        bridge=require('bridge'),
        sl=require('./base'),
        tmpl=require('./tmpl'),
        view=require('./view'),
        Activity=require('./activity'),
        plugin=require('./plugins/template');

    var noop=util.noop,
        indexOf=util.indexOf,
        lastIndexOf=util.lastIndexOf,
        slice=Array.prototype.slice,
        getUrlPath=function (url) {
            var index=url.indexOf('?');
            if(index!= -1) {
                url=url.substr(0,index);
            }
            return url.toLowerCase();
        };

    var Application=view.extend({
        events: {
            'tap,click a[href]:not(.js-link-default)': function (e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('href'))) {
                    e.preventDefault();
                    if(e.type=='tap') {
                        var href=target.attr('href');
                        if(!/^#/.test(href)) href='#'+href;
                        target.attr('forward')!=null?that._currentActivity.forward(href):target.attr('back')!=null?that._currentActivity.back(href):that.to(href);
                    }

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            },
            'tap [data-href]': function (e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('data-href'))) {
                    that.to(target.attr('data-href'));
                }
            },
            'tap [data-back]': function (e) {
                this._currentActivity.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function (e) {
                this._currentActivity.forward($(e.currentTarget).attr('data-forward'));
            },
            'touchmove header,footer': function (e) {
                e.preventDefault();
            }
        },

        el: '<div class="viewport"></div>',

        routes: [],
        mapRoute: function (options) {
            var routes=this.routes;
            $.each(options,function (k,opt) {
                var parts=[],
                    routeOpt={};

                var reg='^(?:\/{0,1})'+k.replace(/(\/|^|\?){([^\/\?]+)}/g,function (r0,r1,r2) {
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
        matchRoute: function (url) {
            var result=null,
                queries={},
                hash=url.replace(/^#/,'')||'/';

            url=hash;

            var index=url.indexOf('?');
            var query;
            if(index!= -1) {
                query=url.substr(index+1);

                url=url.substr(0,index);

                query.replace(/(?:^|&)([^=&]+)=([^&]*)/g,function (r0,r1,r2) {
                    queries[r1]=decodeURIComponent(r2);
                    return '';
                })
            } else {
                query='';
            }

            $.each(this.routes,function (i,route) {
                var m=route.reg?url.match(route.reg):null;

                if(m) {
                    result={
                        url: m[0],
                        hash: hash,
                        view: route.view,
                        data: {},
                        queryString: query,
                        queries: queries
                    };
                    $.each(route.parts,function (i,name) {
                        result.data[name]=m[i+1];
                    });
                    return false;
                }
            });

            return result;
        },

        initialize: function () {
            var that=this;

            that.mask=$('<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div>').on('tap click touchend touchmove touchstart',function (e) {
                e.preventDefault();
            }).appendTo(document.body);
        },

        skip: 0,
        _history: [],
        _historyCursor: -1,
        _currentActivity: null,

        _queue: [],

        queue: function (context,fn) {
            var queue=this._queue;
            var args=slice.call(arguments,2);
            queue.push(context,fn,args);

            if(queue.length===3)
                fn.apply(context,args);
        },

        turning: function () {
            var that=this;
            var queue=that._queue;

            if(queue.length>=3) {
                queue.splice(0,3);
                if(queue.length) {
                    queue[1].apply(queue[0],queue[2]);
                }
            }
        },

        start: function () {
            sl.app=this;

            bridge.android2&&util.style('header,footer{position:absolute}');

            var that=this;
            var hash;

            if(!location.hash) location.hash='/';
            that.hash=hash=location.hash.replace(/^#/,'')||'/';

            that.queue(that,that._getOrCreateActivity,hash,function (activity) {
                that._currentActivity=activity;
                that._history.push(activity.hash);
                that._historyCursor++;

                activity.$el.appendTo(that.$el);
                activity.then(function () {
                    activity.trigger('Resume');
                    activity.trigger('Show');
                    that.turning();
                });

                $(window).on('hashchange',function () {
                    hash=that.hash=location.hash.replace(/^#/,'')||'/';
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
                        that._currentActivity[isForward?'forward':'back'](that.hash);

                    } else if(that.skip>0)
                        that.skip--;
                    else
                        that.skip=0;

                    that.isHistoryBack=false;
                });
            });

            that.$el.appendTo(document.body);
        },

        _to: function (url) {
            this._navigate(url);
            this.turning();
        },

        to: function (url) {
            this.queue(this,this._to,url.replace(/^#/,'')||'/');
        },

        _navigate: function (url) {
            var that=this,
                activity=that._currentActivity,
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

        navigate: function (url) {
            this.skip++;
            this._navigate(url);
        },

        _activities: {},

        get: function (url) {
            return this._activities[getUrlPath(url)];
        },

        set: function (url,activity) {
            this._activities[getUrlPath(url)]=activity;
        },

        remove: function (url) {
            this._activities[getUrlPath(url)]=undefined;
        },

        siblings: function (url,url1) {
            $.each(this._activities,function (k,activity) {
                if(typeof activity!=='undefined'&&k!=url&&k!=url1) {
                    activity.$el.addClass('stop');
                }
            });
        },

        viewPath: 'views/',

        _getOrCreateActivity: function (url,callback) {
            var that=this,
                route=that.matchRoute(url);

            if(!route) return;

            var activity=that.get(route.url);

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function (ActivityClass) {
                    if(ActivityClass!=null) {
                        activity=new ActivityClass({
                            application: that,
                            route: route
                        });
                        that.set(route.url,activity);

                        activity.then(function () {
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

        isHistoryBack: false,
        back: function () {
            this.isHistoryBack=true;
            history.back();
        }
    });

    sl.Application=Application;

    return Application;
});
