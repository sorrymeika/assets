define(['$','sl/activity','app','sl/widget/loading'],function(require,exports,module) {
    var $=require('$'),
        Activity=require('sl/activity'),
        Loading=require('sl/widget/loading'),
        app=require('app'),
        util=require('util');

    module.exports=Activity.extend({
        template: 'views/ourdesigner.html',
        events: {
            'tap .js_back': 'back'
        },
        onCreate: function() {
            var that=this;

            that.$list=that.$('.js_list');
            that.loading=new Loading(that.$list);
            that.loading.load({
                url: '/json/about/designer',
                success: function(res) {
                    that.$list.html(that.tmpl('list',res));
                }
            });
        },
        onStart: function() {
        },
        onResume: function() {
        },
        onDestory: function() {
        }
    });;
});