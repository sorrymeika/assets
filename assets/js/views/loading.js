define('views/loading',['$','ui/sl','app','ui/loading'],function (require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        Loading=require('ui/loading');

    var ViewLoading=Loading.extend({

        check: function (res) {
            return !!(res&&res.ReturnCode=="00000");
        },

        keys: ['pageindex','pagelen'],

        dataKeys: ['Index','Len','','PageNum'],

        hasData: function (res) {
            return !!res;
        }
    });

    sl.zeptolize('Loading',ViewLoading);

    module.exports=ViewLoading;
});
