define(['$','./linklist'],function(require,exports,module) {

    var $=require('$');
    var LinkList=require('./linklist');

    var drawImage=function(ctx,imageList,item) {

        var imageTop=imageList.marginTop+item.index*(imageList.marginTop+imageList.height),
            top=imageTop-imageList.scrollTop,
            sy=imageList.scrollTop-imageTop;

        if(top+imageList.height>=0) {
            sy=sy<=0?0:sy;

            ctx.drawImage(item.img,0,sy,item.img.width,item.img.height-sy,imageList.left,imageList.top+(top<0?0:top),imageList.width,imageList.height-sy);
        }
    }

    function ImageCanvas(canvas) {
        var that=this;

        this.canvas=canvas;
        this.context=canvas.getContext('2d');

        this.images=new LinkList();

        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        $(window).on('ortchange',function() {
            canvas.width=window.innerWidth;
            canvas.height=window.innerHeight;
            that.draw();
        });

        window.ctx=this.context;
    }

    ImageCanvas.prototype={
        clearRect: function() {
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        },

        draw: function() {
            var that=this,
                index,
                ctx=that.context;

            that.clearRect();

            this.images.each(function(imageList) {
                index=0;

                imageList.each(function(data) {
                    var item=this;
                    item.index=index;

                    if(!item.img) {
                        item.img=new Image();
                        $(item.img).appendTo('body')
                        item.img.onload=function() {
                            drawImage(ctx,imageList,item);
                            item.loaded=true;
                        }
                        item.img.src=data;

                    } else if(item.loaded) {
                        drawImage(ctx,imageList,item);
                    }

                    index++;
                });

            });
        },

        add: function(imageList) {
            var list=new LinkList();

            list.scrollTop=imageList.scrollTop||0;
            list.left=imageList.left||0;
            list.top=imageList.top||0;
            list.width=imageList.width||0;
            list.height=imageList.height||0;
            list.marginTop=imageList.marginTop||0;

            for(var i=0,item,src,n=imageList.list.length;i<n;i++) {
                src=imageList.list[i];

                item=list.append(src);
            }

            this.images.append(list);

            return list;
        }
    }

    var imageCanvas=new ImageCanvas(document.getElementsByTagName('canvas')[0]);

    var imageItem=imageCanvas.add({
        top: 50,
        left: 0,
        marginTop: 50,
        width: 100,
        height: 100,
        scrollTop: 50,
        list: ['http://images4.c-ctrip.com/target/hotel/65000/64650/ca6d75857e124b328629894ce6ee1362_130_130.jpg','http://images4.c-ctrip.com/target/hotel/53000/52741/2f631f5c7979400883b58230f4bb3640_130_130.jpg']
    });

    imageCanvas.draw();


    setTimeout(function() {
        imageItem.scrollTop=100;
        imageCanvas.draw();
    },1000);



    module.exports=ImageCanvas;
});
