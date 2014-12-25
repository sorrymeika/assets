define(['$','util','bridge','./activity','./tmpl','./view','./plugins/template'],function(require,exports,module) {

    var $=require('$'),
        util=require('util'),
        app=require('bridge'),
        sl=require('./base'),
        tmpl=require('./tmpl'),
        view=require('./view'),
        Activity=require('./activity'),
        plugin=require('./plugins/template');

    var noop=util.noop,
        indexOf=util.indexOf,
        lastIndexOf=util.lastIndexOf,
        slice=Array.prototype.slice,
        getUrlPath=function(url) {
            var index=url.indexOf('?');
            if(index!= -1) {
                url=url.substr(0,index);
            }
            return url.toLowerCase();
        };

    var Application=view.extend({
        events: {
            'tap,click a:not(.js-link-default)': function(e) {
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
            'tap [data-href]': function(e) {
                var that=this,
                    target=$(e.currentTarget);

                if(!/http\:|javascript\:|mailto\:/.test(target.attr('data-href'))) {
                    that.to(target.attr('data-href'));
                }
            },
            'tap [data-back]': function(e) {
                this._currentActivity.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function(e) {
                this._currentActivity.forward($(e.currentTarget).attr('data-forward'));
            },
            'touchmove header,footer': function(e) {
                e.preventDefault();
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
                hash=url.replace(/^#/,'')||'/';

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
                        url: m[0],
                        hash: hash,
                        view: route.view,
                        data: {},
                        queryString: query,
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

            that.mask=$('<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div>').on('tap click touchend touchmove touchstart',function(e) {
                e.preventDefault();
            }).appendTo(document.body);
        },

        skip: 0,
        _history: [],
        _historyCursor: -1,
        _currentActivity: null,

        start: function() {
            sl.app=this;

            var that=this;

            if(!location.hash) location.hash='/';
            that.hash=location.hash.replace(/^#/,'')||'/';

            that._getOrCreateActivity(that.hash,function(activity) {
                that._currentActivity=activity;
                that._history.push(activity.hash);
                that._historyCursor++;
                activity.$el.appendTo(that.$el);
                activity.then(function() {
                    activity.trigger('Resume');
                    activity.trigger('Show');
                });

                $(window).on('hashchange',function() {
                    that.hash=location.hash.replace(/^#/,'')||'/';

                    var index=lastIndexOf(that._history,that.hash),
                    isForward=that._skipRecordHistory||index== -1;

                    if(that._skipRecordHistory!==true) {
                        if(index== -1) {
                            that._history.push(that.hash);
                            that._historyCursor++;
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
                });
            });

            that.$el.appendTo(document.body);
        },

        to: function(url) {
            url=url.replace(/^#/,'')||'/';

            var that=this,
                activity=that._currentActivity,
                index=lastIndexOf(that._history,url);

            if(!activity.compareUrl(url)) {
                activity.prepareExitAnimation();
            }

            if(index== -1) {
                that._history.splice(that._historyCursor+1,0,url);
                that._history.length=that._historyCursor+2;
                that._historyCursor++;
                that._skipRecordHistory=true;
                location.hash=url;

            } else {
                history.go(index-that._historyCursor);
            }
        },

        navigate: function(url) {
            this.skip++;
            this.to(url);
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

        siblings: function(url,url1) {
            $.each(this._activities,function(k,activity) {
                if(typeof activity!=='undefined'&&k!=url&&k!=url1) {
                    activity.$el.addClass('stop');
                }
            });
        },

        viewPath: 'views/',

        _getOrCreateActivity: function(url,callback) {
            var that=this,
                route=that.matchRoute(url);

            if(!route) return;

            var activity=that.get(route.url);

            if(activity==null) {
                seajs.use(that.viewPath+route.view,function(ActivityClass) {
                    if(ActivityClass!=null) {
                        activity=new ActivityClass({
                            application: that,
                            route: route
                        });
                        that.set(route.url,activity);

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
        }
    });

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
        Application: Application,
        tip: sl.functionlize(Tip,function(actionName) {
            this.text(actionName).show(3000);
        })
    });

    return Application;
});
