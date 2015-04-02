define(function(require,exports,module) {
    var guid=0;

    var LinkList=function(item) {
        this.G=guid++;
        this.N='_idleNext'+this.G;
        this.P='_idlePrev'+this.G;

        if(item) this.init(item);
    }

    var next=function(item,keyPrev) {
        if(null===item||item[keyPrev]==item) return null;
        return item[keyPrev];
    };

    var remove=function(item,keyNext,keyPrev) {
        if(item[keyNext]) {
            item[keyNext][keyPrev]=item[keyPrev];
        }

        if(item[keyPrev]) {
            item[keyPrev][keyNext]=item[keyNext];
        }

        item[keyNext]=null;
        item[keyPrev]=null;
    };

    LinkList.prototype={
        length: 0,

        init: function(item) {
            this.list=item;
            this.length=1;

            item[this.N]=item;
            item[this.P]=item;
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
                length=this.length,
                p=this.P;

            while(i<length) {
                nextItem=next(first,p);

                if(fn.call(first,first)===false) break;

                first=nextItem;
                i++;
            }
        },
        each: function(fn) {
            var first=this.list,
                nextItem,
                p=this.P;

            while(first) {
                nextItem=next(first,p);

                if(fn.call(first,first)===false) break;

                if(nextItem===this.list) break;
                first=nextItem;
            }
        },

        next: function(item) {
            if(null===item||item[this.P]==item) return null;
            return item[this.P];
        },

        append: function(item) {
            var list=this.list;
            if(!list) {
                this.init(item);

            } else if(list!==item) {
                var p=this.P,
                    n=this.N;

                remove(item,n,p);

                item[n]=list[n];
                list[n][p]=item;
                item[p]=list;
                list[n]=item;
                this.length++;
            }
        },

        shift: function() {
            var first=this.list;
            if(first) {
                this.list=next(this.list,this.P);
                this.remove(first);
            }
            return first;
        },

        remove: function(item) {
            remove(item,this.N,this.P);
            this.length--;
            if(this.length==0) {
                this.list=null;
            }
        },

        isEmpty: function() {
            return this.list==null;
        }
    };

    module.exports=LinkList;
});
