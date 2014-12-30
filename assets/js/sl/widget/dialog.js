define(['$','util','./../view','./../tmpl'],function (require,exports,module) {
    var $=require('$'),
        tmpl=require('./../tmpl'),
        sl=require('./../base'),
        view=require('./../view');

    var util=require('util');
    var mask=null;

    var Dialog=view.extend({
        events: {
            'tap .js_dialog_btn': 'action',
            'tap .js_close_dialog': function () {
                this.hide();
            },
            'touchmove': function (e) {
                e.preventDefault();
            }
        },
        className: 'dialog',
        el: '<div></div>',
        template: tmpl('{%if (isShowClose)%}<div class="dialog-close js_close_dialog"></div>{%/if%}{%if (isShowTitle)%}<div class="dialog-title"><h3>${title}</h3></div>{%/if%}<div class="dialog-content js_content">{%html content%}</div><div class="dialog-btns">{%each(i,button) buttons%}<a class="dialog-btn js_dialog_btn${button.className?" "+button.className:" "}">${button.text}</a>{%/each%}</div>'),
        options: {
            isShowClose: false,
            isShowTitle: true,
            title: null,
            content: null,
            buttons: []
        },

        initialize: function () {
            var that=this;

            var options=util.pick(that.options,['isShowClose','isShowTitle','title','content','buttons']);
            that.$el.html(that.template(options));

            that.$content=that.$('.js_content');
        },

        action: function (e) {
            this.options.buttons[$(e.currentTarget).index()].click.call(this,e);
        },

        hide: function () {
            mask.hide();

            this.$el.hide();
            this.trigger('Hide');
        },

        show: function () {
            if(!mask) {
                mask=$('<div style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background: #888;opacity: 0.5;z-index:2000;display:none"></div>').appendTo(document.body);
            }

            mask.show();

            this.$el.appendTo(document.body).show()
                .css({
                    top: window.scrollY+(window.innerHeight-this.$el.height())/2
                });

            this.trigger('Show');
        },

        content: function (content) {
            if(typeof content==='undefined')
                return this.$content;

            this.$content.html(content);
        }
    });

    var _prompt=null;

    sl.prompt=function (title,callback,type) {
        if(!callback) {
            callback=title;
            title="请输入";
        }

        if(!_prompt) {
            _prompt=new Dialog({
                title: title,
                content: '<input type="text" class="prompt-text" /><input type="password" class="prompt-text" />'
            });
        } else {
            _prompt.title(title);
        }
        _prompt.$('input.prompt-text').val('').hide().filter('[type="'+(type||'text')+'"]').show();

        _prompt.options.onOk=function () {
            return callback.call(this,this.$('input[type="'+(type||'text')+'"].prompt-text').val());
        }

        _prompt.options.onCancel=function () {
            callback.call(this);
        }

        _prompt.show();

        $(window).one('hashchange',function () {
            _prompt.hide();
        });
    };

    var _confirm=null;

    sl.confirm=function (title,text,ok,cancel) {
        var options={};
        if($.isPlainObject(title)) {
            cancel=ok;
            ok=text;
            $.extend(options,title);

        } else if($.isFunction(text)) {
            cancel=ok;
            ok=text;
            options.content=title,
            options.title="确认提示";
        } else {
            options.title=title,
            options.content=text;
        }

        if(!_confirm) {
            _confirm=new Dialog(options);
        } else {
            _confirm.title(options.title);
            _confirm.$('.dialog-content').html(options.content);

            _confirm.$('.js_hide').html(options.cancelText||'取消');
            _confirm.$('.js_ok').html(options.okText||'确定');
        }

        _confirm.options.onOk=function () {
            ok.call(this);
        }

        _confirm.options.onCancel=function () {
            cancel&&cancel.call(this);
        }

        _confirm.show();

        $(window).one('hashchange',function () {
            _confirm.hide();
        });
    };

    return Dialog;
});
