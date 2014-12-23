define(['$','bridge','sl/activity','sl/widget/loading','sl/widget/slider'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        App=require('sl/app'),
        app=require('bridge'),
        Loading=require('sl/widget/loading'),
        Slider=require('sl/widget/slider');

    return Activity.extend({
        template: 'views/index.html',

        onCreate: function() {
            var that=this,
                $list=that.$('.js_list');

            that.loading=new Loading($list);
            that.loading.load({
                url: '/Json/Product/GetProducts',
                pageIndex: 1,
                pageSize: 5,
                success: function(res) {
                    that.slider=new Slider($list,{
                        data: res.data,
                        itemTemplate: '<div style="position:relative"><img class="home_tee_img" src="${Picture}" onerror="this.src=\'\'" /><b class="home_buy_btn"></b></div>'
                    });
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
