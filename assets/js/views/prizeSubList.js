define('views/prizeSubList',['zepto','ui/sl','ui/tabs','app','views/loading'],function(require,exports,module) {
    var $=require('zepto'),
        sl=require('ui/sl'),
        app=require('app'),
        Tabs=require('ui/tabs'),
        Loading=require('views/loading'),
        common=sl.common;

    module.exports=sl.Activity.extend({
        template: 'views/prizeSubList.html',
        events: {
            'tap .J_Back': 'back',
            'tap .J_List [data-id]': 'toPrize'
        },
        toPrize: function(e) {
            var $target=$(e.currentTarget),
                id=$target.attr('data-wid');

            common.Prize=this.data['data_'+id];

            this.to('/prize.html');
        },
        onCreate: function() {
            var that=this;

            that.id=that.route.data.id;

            that.data={};

            that.$el.loading({
                keys: ['curindex','len']
            }).loading('load',{
                url: '/api/CPService/QueryAnnouncementList/?ct=json&gameid='+that.id+'&wagerissue=&qsnum=10',
                success: function(res) {
                    $.each(res.Data,function(i,item) {
                        that.data['data_'+item.WagerIssue]=item;
                        item.Nums=item.LotteryNum.split(',');
                    });
                    res.isFirst=true;

                    that.$('.J_List').html(that.tmpl('list',res));
                },
                refresh: function(res) {
                    $.each(res.Data,function(i,item) {
                        that.data['data_'+item.WagerIssue]=item;
                        item.Nums=item.LotteryNum.split(',');
                    });

                    res.isFirst=false;

                    that.$('.J_List').append(that.tmpl('list',res));
                }
            });
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });
});
