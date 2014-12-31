﻿define(['$','util','views/auth','bridge','sl/widget/loading','sl/widget/button'],function(require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        AuthActivity=require('views/auth'),
        Loading=require('sl/widget/loading');
    var util=require('util');
    var button=require('sl/widget/button');

    module.exports=AuthActivity.extend({
        template: 'views/user.html',
        events: {
            'tap .js_back': 'back',
            'tap .js_show_add': 'showAddressAdding',
            'tap .js_add_address': 'addAddress',
            'tap .btn_delete': 'deleteAddress',
            'tap .js_avatars': 'pickImage',
            'tap .js_update': 'update',
            'tap .js_address .commonuse': function(e) {
                var $target=$(e.currentTarget);
                var $con=$target.closest('div');
                var id=$con.data('id');
                $target.find('.checkbox').addClass('checked');
                $con.siblings("[data-id]").find('.checked').removeClass('checked');
                $.post(bridge.url('/json/user/setCommonUseAddress'),{
                    Account: this.userInfo.Account,
                    Auth: this.userInfo.Auth,
                    AddressID: id
                });
            },
            'tap .js_address_add .checkbox': function(e) {
                $(e.currentTarget).toggleClass('checked');
            }
        },
        onCreate: function() {
            var that=this;

            that.$list=that.$('.js_list');
            that.loading=new Loading(that.$('.js_main'));
            that.addressLoading=new Loading(that.$('.js_address'));

            var userInfo=util.store("USERINFO");

            that.onActivityResult('login',function() {
                that.loadData();
            });

            if(userInfo) {
                that.loadData();
            }
        },

        addAddress: button.sync(function() {
            var that=this;
            var data={
                Account: this.userInfo.Account,
                Auth: this.userInfo.Auth,
                CityID: 0,
                RegionID: 0,
                Zip: '',
                Receiver: that.$('.js_reciever').val(),
                Phone: that.$('.js_phone').val(),
                Address: that.$('.js_txt_address').val()
            };
            return {
                url: '/json/user/addaddress',
                data: data,
                success: function(res) {
                    if(res.success) {
                        sl.tip("添加成功");
                        that.$('.js_address_add').hide();
                        that.addressLoading.reload();
                    } else
                        sl.tip(res.msg);
                }
            }
        }),

        pickImage: function() {
            var that=this;

            bridge.pickImage(function(res) {
                that.avatars=res.path;
                that.$('.js_avatars').attr({ src: res.src });
            });
        },

        update: button.sync(function() {

            if(that.avatars) {
                bridge.post("/json/user/uploadAvatars",{
                    Account: this.userInfo.Account,
                    Auth: this.userInfo.Auth
                },{
                    Avatars: that.avatars
                },function() {
                });
            }

            return {
                url: '/json/user/modify',
                data: {
                    Account: this.userInfo.Account,
                    Auth: this.userInfo.Auth,
                    UserName: that.$('.js_name').html(),
                    RealName: that.$('.js_realname').html(),
                    Birthday: that.$('.js_birthday').html(),
                    Mobile: that.$('.js_mobile').html()
                },
                success: function(res) {
                    if(res.success) {
                        sl.tip('更新成功！')
                    } else {
                        sl.tip(res.msg);
                    }
                }
            }

        }),

        showAddressAdding: function() {
            this.$('.js_address_add').show();
        },

        deleteAddress: function() {
            var $checked=that.$('.js_address').find('.checked');
            var $con=$checked.closest('[data-id]');

            if($con.length) {
                var id=$con.data('id');
            } else {
                sl.tip('请选择地址');
            }
        },

        loadData: function() {
            var that=this;
            var userInfo=util.store("USERINFO");

            that.loading.load({
                url: '/json/user/getUserInfo',
                data: {
                    Account: userInfo.Account,
                    Auth: userInfo.Auth
                },
                checkData: false,
                success: function(res) {

                    if(res.success&&res.userinfo) {
                        var item=res.userinfo;

                        that.$('.js_avatars').attr({ src: item.Avatars });
                        that.$('.js_name').html(item.UserName);
                        that.$('.js_realname').html(item.RealName);
                        that.$('.js_mobile').html(item.Mobile);
                        that.$('.js_birthday').html(item.Birthday?item.Birthday.replace(/\s00\:00\:00$/,''):'');

                        that.$('.js_gender').html(item.Gender==1?"男":item.Gender==0?"女":"保密");

                    }
                },
                complete: function() {
                    that.addressLoading.load({
                        url: '/json/user/getaddress',
                        data: {
                            Account: userInfo.Account,
                            Auth: userInfo.Auth
                        },
                        checkData: false,
                        success: function(res) {

                            if(res.success&&res.data&&res.data.length) {
                                var html=[];
                                $.each(res.data,function(i,item) {
                                    html.push('<div data-id="'+item.AddressID+'"><span>地址'+(i+1)+'</span><p>'+item.Address+'</p><p class="commonuse"><i class="checkbox'+(item.IsCommonUse?' checked':'')+'"></i>设为收货地址</p></div>');
                                });
                                that.$('.js_address').html(html.join(''));

                            } else {
                                that.$('.js_address').html('<div class="nodata">您还未添加收货地址</div>');
                            }
                        }
                    });
                }
            });



        },

        onDestory: function() {
        }
    });
});
