define('views/index',['zepto','sl/sl','app'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('sl/sl'),
        app=require('app');

    module.exports=sl.Activity.extend({
        template: 'views/index.html',
        _events: {
            'touchstart': function(e) {
                var that=this,
                    point=e.touches[0];

                that.pointX=point.pageX;
                that.pointY=point.pageY;

                if(that.pointX<=10) {
                    that.isFromEdge=true;
                }
            },
            'touchmove': function(e) {

                if(!this.isFromEdge) return;

                e.preventDefault();

                var that=this,
                    point=e.touches[0],
                    changeX=that.pointX-point.pageX;

                if(!that._menu) {
                    that.application.getOrCreate('/menu/index.html',function(activity) {
                        that._menu=activity;

                        activity.bind('Destory',function() {
                            that._menu=null;
                        });

                        activity.el.style['-webkit-transition-duration']='0ms';
                        activity.el.style.width=window.innerWidth*.6+'px';
                        activity.$('.menu').css({ width: '100%' });
                        activity.el.style['-webkit-transform']='translate(-'+(window.innerWidth*.6+changeX)+'px,0px)';
                    });
                } else {
                    that._menu.el.style['-webkit-transform']='translate(-'+(window.innerWidth*.6+changeX)+'px,0px)';
                    that._menu.$('.menu').css({ width: '100%' });
                }
            },
            'touchend': function(e) {
                if(!this.isFromEdge) return;

                if(this._menu) {
                    var that=this,
                    point=e.changedTouches[0],
                    changeX=that.pointX-point.pageX;

                    if(changeX<40) {
                        that._menu.$('.menu').css({ width: '' });
                        that._menu.el.style.width='';

                        that._menu.start();
                        that._menu.el.style['-webkit-transform']='';
                        that._menu.el.style['-webkit-transition-duration']='';

                        location.href='#/menu/index.html';
                    } else {
                        that._menu.finish();
                    }
                }

                that.isFromEdge=false;
            }
        },

        _dfdController: $.when(),

        _index: 0,
        onCreate: function() {
            var that=this;

            $.each(that._events,function(evt,f) {
                var arr=evt.split(' '),
                    events=arr.shift();

                events=events.replace(/,/g,' ');

                f=$.isFunction(f)?f:that[f];

                if(arr.length>0&&arr[0]!=='') {
                    that._bind(arr.join(' '),events,f);
                } else {
                    that.bind(events,f);
                }
            });
        },
        onStart: function() {
        },
        onResume: function() {
            console.log("index onResume");
        },
        onDestory: function() {
            console.log("index onDestory");
        }
    });
});
