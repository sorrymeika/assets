define(['$','./../base','./../view','./../tmpl','./touch'],function (require,exports,module) {
    var $=require('$'),
        Touch=require('./touch');

    tmpl=require('./../tmpl');

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
        minDelta: 0,
        move: function (x,y) {
            var that=this;
            that.con.scrollTop=y;
        },

        _startAni: function (x,y,duration) {
            var a=y%26;
            y=y-(a>20?a-26:a);
            Touch.prototype._startAni.call(this,x,y,duration);
        },

        end: function () {
            var y=this.y;
            var a=y%26;
            y=y-(a>20?a-26:a);
            if(this.y!=y) {
                this._moving(0,y,200);
            }
            var index=Math.round(y/26);
            this.trigger('Change',[index,this.data[index]]);
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
            this.$bd.html(html.join(''));
        }
    });

    var Selector=function (options) {
        options=$.extend({
            data: []
        },options);

        var that=this;
        var data=options.data;

        !$.isArray(data[0])&&(data=[data]);

        this.$el=$('<div class="selectorwrap"><div class="selectorbar"><b class="js_click">完成</b></div></div>').appendTo(document.body);
        this.selectors=[];

        $.each(data,function (i,item) {
            that.render(item);
        });

        this.$el.on("click",'.js_click',function () {
            that.hide();
        });
    };

    Selector.prototype={
        _visible: true,
        render: function (data) {
            var sel=new selector({
                data: data
            });
            this.selectors.push(sel);
            this.$el.append(sel.$el);
        },
        hide: function () {
            var that=this;
            this._visible&&this.$el.css({
                '-webkit-transform': 'translate(0px,0%)'
            })
            .animate({
                'translate': '0px,100%'
            },300,'ease-out',function () {
                that._visible=false;
                $(this).hide();
            })
        },
        show: function () {
            !this._visible&&this.$el.css({
                'display': 'block',
                '-webkit-transform': 'translate(0px,100%)'
            })
            .animate({
                'translate': '0px,0%'
            },300,'ease-out',function () {
                that._visible=true;
            });
        }
    };

    return Selector;
});
