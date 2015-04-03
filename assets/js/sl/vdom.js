define(['$','./linklist'],function (require,exports,module) {

    var $=require('$');
    var LinkList=require('./linklist');

    function VirtualDom(el) {
        var that=this;

        this.el=el;

        this.nodes=new LinkList();
    }

    VirtualDom.prototype={
        draw: function () {
            var that=this,
                index,
                showFlag,
                top,
                nodeTop,
                nodeHeight,
                autoHeight,
                offsetHeight,
                display;

            this.nodes.each(function (nodeList) {
                index=0;
                showFlag=false;
                nodeTop=0;
                autoHeight=nodeList.height==='auto';

                if(autoHeight) nodeList.$el.show();

                nodeList.each(function (data) {
                    var node=this;
                    node.index=index;
                    nodeHeight=autoHeight?nodeList.listHeight:nodeList.height;

                    if(autoHeight) nodeTop+=nodeList.marginTop;
                    else nodeTop=nodeList.marginTop+node.index*(nodeList.marginTop+nodeList.height);

                    top=nodeTop-nodeList.scrollTop;

                    if(top+nodeHeight>0&&top<nodeList.listHeight) {

                        if(!node.el) {
                            node.$el=$(data).css({ position: 'absolute',marginTop: 0,top: 0,left: 0 });
                            node.$el.appendTo(nodeList.$el);
                            node.el=node.$el[0];
                        }

                        showFlag=true;
                        node.$el.transform({ translate: '0px,'+top+'px',display: '' });

                        if(autoHeight) {
                            offsetHeight=node.el.offsetHeight;
                            nodeTop+=offsetHeight!=0?node.el.offsetHeight:100;
                        }

                    } else if(node.el) {
                        node.el.style.display='none';
                    }

                    index++;
                });

                if(showFlag) {
                    nodeList.$el.show();
                } else {
                    nodeList.$el.hide();
                }

            });
        },

        add: function (nodeList) {
            var list=new LinkList();

            list.scrollTop=nodeList.scrollTop||0;
            list.left=nodeList.left||0;
            list.top=nodeList.top||0;
            list.width=nodeList.width||(window.innerWidth-list.left);
            list.height=nodeList.height||'auto';
            list.listHeight=nodeList.listHeight||(window.innerHeight-list.top);
            list.marginTop=nodeList.marginTop||0;
            list.el=document.createElement('DIV');
            list.el.className='virtualdom';
            list.el.style.cssText='-webkit-transform:translate('+list.left+'px,'+list.top+'px);display:none;width:'+list.width+'px;';
            list.$el=$(list.el).appendTo(this.el);

            for(var i=0,node,el,n=nodeList.list.length;i<n;i++) {
                el=nodeList.list[i];

                node=list.append(el);
            }

            this.nodes.append(list);

            return list;
        }
    }


    module.exports=VirtualDom;
});
