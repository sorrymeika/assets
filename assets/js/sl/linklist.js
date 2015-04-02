define(function(require,exports,module) {

    var LinkList=function(item) {
        if(item) this.init(item);
    }

    var next=function(item) {
        if(null===item||item._idlePrev==item) return null;
        return item._idlePrev;
    };

    var remove=function(item) {
        if(item._idleNext) {
            item._idleNext._idlePrev=item._idlePrev;
        }

        if(item._idlePrev) {
            item._idlePrev._idleNext=item._idleNext;
        }

        item._idleNext=null;
        item._idlePrev=null;
    };

    LinkList.prototype={
        length: 0,
        list: null,

        init: function(item) {
            this.list=item;
            this.length=1;

            item._idleNext=item;
            item._idlePrev=item;
        },

        get: function(fn) {
            var result=null;

            this.fastEach(function(item) {
                if(fn(item)===true) {
                    result=item;
                    return false;
                }
            });

            return result;
        },

        find: function(fn) {
            var result=[];

            this.fastEach(function(item) {
                if(fn(item)===true) {
                    result.push(item);
                }
            });

            return result;
        },

        first: function() {
            return this.list;
        },

        fastEach: function(fn) {
            var first=this.list,
                i=0,
                nextItem,
                length=this.length;

            while(i<length) {
                nextItem=next(first);

                if(fn.call(first,first)===false) break;

                first=nextItem;
                i++;
            }
        },
        each: function(fn) {
            var first=this.list,
                nextItem;

            while(first) {
                nextItem=next(first);

                if(fn.call(first,first)===false) break;

                if(nextItem===this.list) break;
                first=nextItem;
            }
        },

        next: next,

        append: function(item) {
            var list=this.list;
            if(list===null) {
                this.init(item);

            } else if(list!==item) {
                remove(item);
                item._idleNext=list._idleNext;
                list._idleNext._idlePrev=item;
                item._idlePrev=list;
                list._idleNext=item;
                this.length++;
            }
        },

        shift: function() {
            var first=this.list;
            if(first!==null) {
                this.remove(first);
            }
            return first;
        },

        remove: function(item) {
            if(this.length==0) return;

            this.length--;
            if(this.length==0) {
                this.list=null;

            } else if(item==this.list) {
                this.list=next(item);
            }
            remove(item);
        },

        isEmpty: function() {
            return this.list===null;
        }
    };

    module.exports=LinkList;
});
