define(['$','util','./../view','./../razor','./scroll'],function(require,exports,module) {
    var $=require('$'),
        _=require('util'),
        view=require('./../view'),
        razor=require('./../razor');

    window.test=function() {
        var now=Date.now();
    }

    var Scroll=require('./scroll');

    var Slider=Scroll.extend({
        options: {
            index: 0,
            width: '50%',
            onChange: null,
            data: [],
            dots: false,
            imagelazyload: false,
            useTransform: true,
            bounce: true,
            arrow: false,
            ease: 'ease-out',
            vScroll: false,
            hScroll: true
        },

        loop: false,

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

        index: function(index) {
            var options=this.options,
                x;

            if(typeof index==='undefined') return options.index;

            index=index>=this._data.length?0:index<0?this._data.length-1:index;

            if(options.index!=index) {
                this.currentData=this._data[index];
                this._change();
                options.index=index;
            }

            x=index*this.wrapperW;
            if(x!=this.x) this.animate(x,0,200);
        },

        refresh: _.noop,

        _startAni: function(x,y,duration) {
            var w=this.wrapperW;
            var index=this.getIndex();
            var nextL=Math.min((index+1)*w,this.maxX);
            var currL=index*w;
            var prevL=Math.max((index-1)*w,this.minX);

            x=x>currL&&x<nextL?nextL:x<nextL&&x>prevL?prevL:x;

            this.animate(x,y,Math.min(400,duration),this.end);
        },

        data: function(index) {
            return this._data[index||this.options.index];
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
        renderItem: razor.create('<li class="js_slide_item slider-item">@html($data)</li>').T,
        itemTemplate: '@html(TypeName)',
        navTemplate: razor.create('<ol class="js_slide_navs slider-nav">@each(items,i,item){<li class="slide-nav-item@(current) slide-nav-item"></li>}</ol>').T,
        template: razor.create('<div class="slider"><ul class="js_slider slider-con">@html(items)</ul>@html(navs)</div>').T,
        init: function() {
            $.extend(this,_.pick(this.options,['width','loop','render','template','itemTemplate','navTemplate']));

            var that=this,
                data=that.options.data,
                items=[],
                item,
                $slider;

            if(typeof that.itemTemplate==='string') that.itemTemplate=razor.create(that.itemTemplate).T;
            if(typeof that.width=='string') that.width=parseInt(that.width.replace('%',''));

            if(!$.isArray(data)) data=[data];
            that._data=data;
            that.length=data.length;

            if(that.options.index!=undefined) that.options.index=that.options.index;

            for(var i=0,n=data.length;i<n;i++) {
                items.push(that.render(data[i]));
            }
            that.$scroll=$(that.template({
                items: items.join(''),
                navs: ''
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
                    that.index(that.options.index-1);
                })
                .listen('tap .js_next',function(e) {
                    that.index(that.options.index+1);
                });
            }

            $(window).on('ortchange',$.proxy(that._adjustWidth,that));

            setTimeout(function() {
                that._adjustWidth();
            },0)
        },

        _loadImage: function() {
            var that=this;

            var item=that.$items.eq(that.options.index);
            if(!item.prop('_detected')) {

                if(that.loop) {
                    if(that.options.index==0) {
                        item=item.add(that.$slider.children(':last-child'));
                    } else if(that.options.index==that.length-1) {
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

            that.wrapperW=that.scroll.clientWidth*that.width/100;
            that.scrollerW=that.wrapperW*length;

            slider.css({ width: length*that.width+'%',marginLeft: (100-that.width)/2+'%' });

            that.pos(that.wrapperW*that.options.index,0);
            children.css({ width: 100/length+'%' });
        },

        _start: function(e) {
            var that=this;

            if(/js_pre|js_next/.test(e.target.className)) {
                return;
            }

            Scroll.prototype._start.call(this,e);
        },

        _change: function() {
            var that=this,
                options=that.options;

            if(options.onChange) options.onChange.call(that,options.index);
            that.trigger('Change',[options.index,that.currentData]);
        },

        onDestory: function() {
            $(window).off('ortchange',this._adjustWidth);
        }
    });

    module.exports=Slider;
});
