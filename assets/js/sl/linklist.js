define(["./_linklist"],function (require,exports,module) {

    var L=require("./_linklist");

    var LinkList=function (item) {
        if(item) {
            this.list=item;
            this.length=1;
            L.init(item);
        } else {
            this.length=0;
        }
    }

    LinkList.prototype={
        each: function (each) {
            var first=this.list;

            while(first) {
                each.call(this,first);

                first=this.peek();
            }
        },
        peek: function () {
            return this.list==null?null:L.peek(this.list);
        },
        append: function (item) {
            if(!this.list) {
                this.list=item;
                L.init(item);

            } else {
                L.append(this.list,item);
            }
            this.length++;
        },
        shift: function () {
            var first=L.shift(this.list);
            if(first==this.list) this.list=null;
            this.length--;

            return first;
        },
        remove: function (item) {
            if(item==this.list) this.list=L.peek(item);
            L.remove(item);
            this.length--;
        },
        isEmpty: function () {
            return this.list==null;
        }
    };

    module.exports=LinkList;

});
