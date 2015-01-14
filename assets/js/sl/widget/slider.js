define(['$','util','./../view','./../tmpl','extend/ortchange','./touch'],function(require,exports,module) {
    var $=require('$'),
        _=require('util'),
        view=require('./../view'),
        tmpl=require('./../tmpl');

    var Touch=require('./touch');

    require('extend/ortchange');

    var Slider=Touch.extend({
        widgetName: 'Slider',
        options: {
            index: -1,
            width: '100%',
            onChange: null,
            data: [],
            dots: false,
            imagelazyload: false,
            bounce: true,
            arrow: false,
            vScroll: false
        },

        getIndex: function() {

            return Math.round(this.x/this.wrapperW);
        },

        start: function() {
            var that=this;
            var index=this.getIndex();

            that.maxX=Math.min(that.scrollerW-that.wrapperW,(index+1)*that.wrapperW);
            that.minX=Math.max(0,(index-1)*that.wrapperW);
            return true;
        },

        onScroll: function(x,y) {
        },

        onScrollStop: function() {
            var that=this;
            var x=that.x;

            var index=this.getIndex();
            that.index(index);
        },

        _index: 0,
        index: function(i) {
            if(typeof i==='undefined') return this._index;
            i=i>=this._data.length?0:i<0?this._data.length-1:i;

            if(this._index!=i) {
                this.currentData=this._data[i];
                this._change();
                this._index=i;
            }
            var x=i*this.wrapperW;
            x!=this.x&&this.animate(x,0,200);
        },

        _startMomentumAni: function(x,y,duration) {
            //this.animate(x,y,duration);
            var w=this.wrapperW;
            var index=this.getIndex();
            var nextL=Math.min((index+1)*w,this.maxX);
            var currL=index*w;
            var prevL=Math.max((index-1)*w,this.minX);

            x=x>currL&&x<nextL?nextL:x<nextL&&x>prevL?prevL:x;

            this.animate(x,y,Math.min(400,duration),this.end);
        },

        loop: false,
        data: function(index) {
            return this._data[index||this._index];
        },
        appendItem: function() {
            var item=$(this.renderItem(''));
            this.$slider.append(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        prependItem: function() {
            var item=$(this.renderItem(''));
            this.$slider.prepend(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        render: function(dataItem) {
            return this.renderItem(this.itemTemplate(dataItem));
        },
        renderItem: tmpl('<li class="js_slide_item">{%html $data%}</li>'),
        itemTemplate: '${TypeName}',
        navTemplate: tmpl('<ol class="js_slide_navs">{%each(i,item) items%}<li class="slide_nav_item${current}"></li>{%/each%}</ol>'),
        template: tmpl('<div class="slider"><ul class="js_slider">{%html items%}</ul>{%html navs%}</div>'),
        initialize: function() {
            $.extend(this,_.pick(this.options,['width','loop','render','template','itemTemplate','navTemplate']));

            var that=this,
                data=that.options.data,
                items=[],
                item,
                $slider,
                index=that.options.index;

            that._data=data;

            typeof that.itemTemplate==='string'&&(that.itemTemplate=tmpl(that.itemTemplate));
            typeof that.width=='string'&&(that.width=parseInt(that.width.replace('%','')));

            !$.isArray(data)&&(data=[data]);

            that.length=data.length;

            for(var i=0,n=data.length;i<n;i++) {
                items.push(that.render(data[i]));
            }

            that.$scroll=$(that.template({
                items: items.join('')
            })).appendTo(that.$el);
            that.scroll=that.$scroll[0];

            $slider=that.$slider=that.$('.js_slider');
            that.$items=$slider.children();
            that.slider=$slider[0];

            //that.index=index== -1?that.length%2==0?that.length/2-1:Math.floor(that.length/2):index;
            if(that.length<2) that.loop=false;
            else if(that.width<100) that.loop=false;

            var length;
            if(that.loop) {
                $slider.prepend(that.$items.eq(that.length-1).clone());
                $slider.append(that.$items.eq(0).clone());
            } else {
                length=that.length;
            }

            that._adjustWidth();

            if(that.options.imagelazyload) {
                that.bind("Change",function() {
                    that._loadImage();
                });
                that._loadImage();
            }

            if(that.options.arrow) {
                that._prev=$('<span class="slider-pre js_pre"></span>').appendTo(that.$el);
                that._next=$('<span class="slider-next js_next"></span>').appendTo(that.$el);

                that.listen('tap .js_pre',function(e) {
                    that.index(that._index-1);
                })
                .listen('tap .js_next',function(e) {
                    that.index(that._index+1);
                });
            }

            $(window).on('ortchange',$.proxy(that._adjustWidth,that));
        },

        _loadImage: function() {
            var that=this;

            var item=that.$items.eq(that._index);
            if(!item.prop('_detected')) {

                if(that.loop) {
                    if(that._index==0) {
                        item=item.add(that.$slider.children(':last-child'));
                    } else if(that._index==that.length-1) {
                        item=item.add(that.$slider.children(':first-child'));
                    }
                }

                item.find('img[lazyload]').each(function() {
                    this.src=this.getAttribute('lazyload');
                    this.removeAttribute('lazyload');
                });

                item.prop('_detected',true);
            }
        },

        _adjustWidth: function() {
            var that=this,
                slider=that.$slider,
                children=slider.children(),
                length=children.length;

            that.wrapperW=that.scroll.clientWidth;
            slider.css({ width: length*that.width+'%' });

            that.scroll.scrollLeft=that.wrapperW*that._index;
            children.css({ width: 100/length+'%' });
        },

        _start: function(e) {
            var that=this;

            if(/js_pre|js_next/.test(e.target.className)) {
                return;
            }

            Touch.prototype._start.call(this,e);
        },

        _change: function() {
            var that=this;

            that.options.onChange&&that.options.onChange.call(that,that._index);
            that.trigger('Change',[that._index,that.currentData]);
        },

        onDestory: function() {
            $(window).off('ortchange',this._adjustWidth);
        }
    });

    module.exports=Slider;
});
