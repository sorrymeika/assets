define(['$','util','./../base','./../view','./../tmpl','./touch'],function (require,exports,module) {
    var $=require('$'),
        Touch=require('./touch');

    var util=require('util');
    var tmpl=require('./../tmpl');

    var selector=Touch.extend({
        start: function () {
            var that=this;
            that.y=that.con.scrollTop;
            that.startY=that.y;
            that.wrapperH=that.con.clientHeight;
            that.scrollerH=that.con.scrollHeight;
            that.maxY=that.scrollerH-that.wrapperH;
            that.minY=0;
            return true;
        },
        itemHeight: 26,
        minDelta: 0,
        move: function (x,y) {
            var that=this;
            that.con.scrollTop=y;
        },

        _startAni: function (x,y,duration) {
            y=this._getY(y);
            Touch.prototype._startAni.call(this,x,y,duration);
        },
        _getY: function (y) {
            var a=y%26;
            return y-(a>20?a-this.itemHeight:a);
        },

        end: function () {
            var that=this;
            var y=that.y;

            y=this._getY(y);
            if(that.y!=y) {
                that._moving(0,y,200);
            }

            var index=Math.round(y/that.itemHeight);
            that.index(index);
        },

        _index: 0,
        index: function (i) {
            if(typeof i==='undefined') return this._index;
            if(this._index!=i) {
                this.currentData=this.data[i];
                this.trigger('Change',[i,this.currentData]);
                this._index=i;
                this.move(0,i*this.itemHeight);
            }
        },

        val: function (val) {
            if(typeof val==='undefined')
                return this.currentData.value;

            var index=util.indexOf(this.data,typeof val!=="function"?function (item) {
                return item.value==val;
            } :val);

            this.index(index);
        },

        el: '<div class="selector"><div class="selectorcon"><ul></ul></div></div>',

        template: tmpl('<li>${text}</li>'),

        initialize: function () {
            var that=this;
            var options=this.options;
            var data=options.data||[];
            !data.length&&data.push({ text: '无数据' });

            options.onChange&&this.on("Change",options.onChange);

            this.$con=this.$('.selectorcon');
            this.con=this.$con[0];

            this.$bd=this.$('.selectorcon ul');

            this.render(data);
        },

        render: function (data) {
            var that=this;
            var html=[];
            $.each(data,function (i,item) {
                html.push(that.template(item));
            });

            this.data=data;
            this.currentData=data&&data.length?data[0]:{};
            this.$bd.html(html.join(''));
        }
    });

    var Selector=function (options) {
        options=$.extend({
            container: document.body,
            complete: function () { },
            data: []
        },options);

        var that=this;
        var data=options.data;

        !$.isArray(data[0])&&(data=[data]);

        this.$el=$('<div class="selectorwrap" style="display:none"><div class="selectorbar"><b class="js_click">完成</b></div></div>').appendTo(options.container);
        this.$mask=$('<div style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background: rgba(0,0,0,.3);z-index:999;display:none"></div>').appendTo(document.body);
        this.selectors=[];

        that.$mask.on('tap',function () {
            that.hide();
        });

        $.each(data,function (i,item) {
            that.render(item);
        });

        this.$el.on("click",'.js_click',function () {
            that.hide();
            var result=[];
            $.each(that.selectors,function (i,sel) {
                result.push(sel.currentData);
            });

            options.complete&&options.complete.call(that,result);
        });
    };

    Selector.prototype={
        _visible: false,
        eq: function (i) {
            return this.selectors[i];
        },
        each: function (fn) {
            $.each(this.selectors,fn);
        },
        render: function (data) {
            var sel=new selector({
                data: data
            });
            this.selectors.push(sel);
            this.$el.append(sel.$el);
        },
        hide: function () {
            var that=this;
            this._visible&&(that.$mask.hide(),this.$el.css({
                '-webkit-transform': 'translate(0px,0%)'
            })
            .animate({
                'translate': '0px,100%'
            },300,'ease-out',function () {
                that._visible=false;
                $(this).hide();
            }));
            return that;
        },
        show: function () {
            var that=this;

            !that._visible&&(that.$mask.show(),that.$el.css({
                'display': 'block',
                '-webkit-transform': 'translate(0px,100%)'
            })
            .animate({
                'translate': '0px,0%'
            },300,'ease-out',function () {
                that._visible=true;
                that.each(function () {
                    this.move(0,this._index*this.itemHeight);
                });
            }));

            return that;
        },
        destory: function () {
        }
    };

    return Selector;
});
