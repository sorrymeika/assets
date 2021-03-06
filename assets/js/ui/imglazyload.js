﻿define('ui/imglazyload',['$','extend/scrollStop','extend/ortchange'],function (require,exports,module) {
    var $=require('$');

    require('extend/scrollStop');
    require('extend/ortchange');

    var pedding=[];
    $.fn.imglazyload=function (opts) {
        var splice=Array.prototype.splice,
            opts=$.extend({
                threshold: 0,
                container: window,
                urlName: 'data-url',
                placeHolder: '',
                eventName: 'scrollStop',
                innerScroll: false,
                isVertical: true
            },opts),
            $viewPort=$(opts.container),
            isVertical=opts.isVertical,
            isWindow=$.isWindow($viewPort.get(0)),
            OFFSET={
                win: [isVertical?'scrollY':'scrollX',isVertical?'innerHeight':'innerWidth'],
                img: [isVertical?'top':'left',isVertical?'height':'width']
            },
            $plsHolder=$(opts.placeHolder).length?$(opts.placeHolder):null,
            isImg=$(this).is('img');

        !isWindow&&(OFFSET['win']=OFFSET['img']);   //若container不是window，则OFFSET中取值同img

        function isInViewport(offset) {      //图片出现在可视区的条件
            var viewOffset=isWindow?window:$viewPort.offset(),
                viewTop=viewOffset[OFFSET.win[0]],
                viewHeight=viewOffset[OFFSET.win[1]];
            return viewTop>=offset[OFFSET.img[0]]-opts.threshold-viewHeight&&viewTop<=offset[OFFSET.img[0]]+offset[OFFSET.img[1]];
        }

        pedding=Array.prototype.slice.call($(pedding.reverse()).add(this),0).reverse();    //更新pedding值，用于在页面追加图片
        if($.isFunction($.fn.imglazyload.detect)) {    //若是增加图片，则处理placeHolder
            _addPlsHolder();
            return this;
        };

        function _load(div) {     //加载图片，并派生事件
            var $div=$(div),
                attrObj={},
                $img=$div;

            if(!isImg) {
                $.each($div.get(0).attributes,function () {   //若不是img作为容器，则将属性名中含有data-的均增加到图片上
                    ~this.name.indexOf('data-')&&(attrObj[this.name]=this.value);
                });
                $img=$('<img />').attr(attrObj);
            }
            $div.trigger('startload');
            $img.on('load',function () {
                !isImg&&$div.replaceWith($img);     //若不是img，则将原来的容器替换，若是img，则直接将src替换
                $div.trigger('loadcomplete');
                $img.off('load');
            }).on('error',function () {     //图片加载失败处理
                var errorEvent=$.Event('error');       //派生错误处理的事件
                $div.trigger(errorEvent);
                errorEvent.defaultPrevented||pedding.push(div);
                $img.off('error').remove();
            }).attr('src',$div.attr(opts.urlName));

        }

        function _detect() {     //检测图片是否出现在可视区，并对满足条件的开始加载
            var i,$image,offset,div;
            for(i=pedding.length;i--;) {
                $image=$(div=pedding[i]);
                offset=$image.offset();
                isInViewport(offset)&&(splice.call(pedding,i,1),_load(div));
            }
        }

        function _addPlsHolder() {
            !isImg&&$plsHolder&&$(pedding).append($plsHolder);   //若是不是img，则直接append
        }

        $(document).ready(function () {    //页面加载时条件检测
            _addPlsHolder();     //初化时将placeHolder存入
            _detect();
        });

        !opts.innerScroll&&$(window).on(opts.eventName+' ortchange',function () {    //不是内滚时，在window上绑定事件
            _detect();
        });

        $.fn.imglazyload.detect=_detect;    //暴露检测方法，供外部调用

        return this;
    };

});
