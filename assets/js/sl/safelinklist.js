define(function(require,exports,module) {

    var LinkList=function(item) {
        if(item) this.init(item);
    };

    var next=function(item) {
        if(!item||item._idlePrev==item) return null;
        return item._idlePrev;
    };

    var _next=function() {
        var list=next(this.list);
        return list?{
            list: list,
            data: list.data,
            next: function() {
                return _next.call(this)
            }
        }:null;
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

        init: function(item) {
            item={ data: item };
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
            return this.list?this.list.data:null;
        },

        fastEach: function(fn) {
            var first=this.list,
                i=0,
                nextItem,
                length=this.length;

            while(i<length) {
                nextItem=next(first);

                if(fn.call(first,first.data)===false) break;

                first=nextItem;
                i++;
            }
        },
        each: function(fn) {
            var first=this.list,
                nextItem;

            while(first) {
                nextItem=next(first);

                if(fn.call(first,first.data)===false) break;

                if(nextItem===this.list) break;
                first=nextItem;
            }
        },

        next: _next,

        append: function(item) {
            var list=this.list;
            if(!list) {
                this.init(item);

            } else {
                item={ data: item };

                item._idleNext=list._idleNext;
                list._idleNext._idlePrev=item;
                item._idlePrev=list;
                list._idleNext=item;
                this.length++;
            }
        },

        contains: function(item) {
            var res=false;
            that.fastEach(function(cItem) {
                if(item===cItem) {
                    res=true;
                    return false;
                }
            });
            return res;
        },

        shift: function() {
            var first=this.list;
            if(first) {
                this._remove(first);
                return first.data;
            } else {
                return null;
            }
        },

        _remove: function(item) {
            if(this.length==0) return;

            this.length--;
            if(this.length==0) {
                this.list=null;

            } else if(item==this.list) {
                this.list=next(item);
            }
            remove(item);
        },

        remove: function(item) {
            var that=this;

            that.fastEach(function(cItem) {
                if(cItem===item) {
                    that._remove(this);
                    return false;
                }
            });
        },

        isEmpty: function() {
            return this.list==null;
        }
    };

    module.exports=LinkList;
});
