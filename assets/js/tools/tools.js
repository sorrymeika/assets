﻿define(function (require) {
    var $=require('$');

    require('./uglify');

    var meta=document.createElement('meta');
    meta.name="api-base-url";
    meta.content="index.cshtml?path=";

    var head=document.querySelector('head');
    head.insertBefore(meta,head.firstChild);

    var bridge=require('bridge');
    bridge.url=function (url) {
        return /^http\:\/\//.test(url)?url:('index.cshtml?path='+encodeURIComponent(url));
    };

    var compressor=UglifyJS.Compressor({
        sequences: true,  // join consecutive statemets with the “comma operator”
        properties: true,  // optimize property access: a["foo"] → a.foo
        dead_code: true,  // discard unreachable code
        drop_debugger: true,  // discard “debugger” statements
        unsafe: false, // some unsafe optimizations (see below)
        conditionals: true,  // optimize if-s and conditional expressions
        comparisons: true,  // optimize comparisons
        evaluate: true,  // evaluate constant expressions
        booleans: true,  // optimize boolean expressions
        loops: true,  // optimize loops
        unused: true,  // drop unused variables/functions
        hoist_funs: true,  // hoist function declarations
        hoist_vars: false, // hoist variable declarations
        if_return: true,  // optimize if-s followed by return/continue
        join_vars: true,  // join var declarations
        cascade: true,  // try to cascade `right` into `left` in sequences
        side_effects: true,  // drop side-effect-free statements
        warnings: true,  // warn about potentially dangerous optimizations/code
        global_defs: {}
    });

    var parse=function (code) {
        var ast=UglifyJS.parse(code);
        ast.figure_out_scope();
        ast=ast.transform(compressor);
        ast.compute_char_frequency();
        ast.mangle_names();
        code=ast.print_to_string();

        return code;
    };

    var replaceDefine=function (id,code) {

        return code.replace(/^\s*define\(([^\(]+?,){0,1}function/,function (r0,p) {

            p=eval('['+(p||'')+']');
            typeof p[0]==='string'?(p[0]=id):p.splice(0,0,id);

            return 'define('+JSON.stringify(p).replace(/(^\[)|(\]$)/g,'')+',function';
        })
    };


    var tools={
        times: 0,

        finish: function (path,text) {
            if(this.times==0) {
                $.post('tools.cshtml?action=finish',{
                    path: path,
                    text: text

                },function (res) {
                    console.log(res);
                });
            }
        },

        ajax: function (url,data) {
            var that=this;
            that.times++;

            $.post(url,data,function (res) {
                console.log(url+' '+res);

                that.times--;
                that.finish();
            });
        },

        save: function (path,text) {
            this.ajax('tools.cshtml?action=save',{
                path: path,
                text: text
            });
        },

        js: function (path) {
            var that=this;

            $.each(path,function (i,items) {
                var result=[];
                var combine=function () {

                    if(!items.length) {
                        var code=result.join('\n');

                        that.save('js/'+i+'.js',code);
                        return;
                    }

                    var id=items.shift();
                    var url=seajs.resolve(id);

                    $.get(url+'?'+new Date().getTime(),function (res) {

                        res=parse(replaceDefine(id,res));

                        result.push(res);

                        combine();
                    });
                };

                combine();
            });

            return this;
        },

        html: function (path,js,api) {
            var api='<meta name="api-base-url" content="'+api+'" />';
            var that=this,
                scriptOpen='<script src="js/',
                scriptClose='.js"></script>';

            $.each(path,function (i,url) {
                $.get(url+'?'+new Date().getTime(),function (res) {
                    res=res.replace(/<script[^>]+debug[^>]*>[\S\s]*?<\/script>/img,'')
                            .replace('<head>','<head>'+api)
                            .replace(/<script[^>]*>([\S\s]*?)<\/script>/img,function (r0,r1) {
                                if(!$.trim(r1)) return r0;
                                return '<script>'+parse(r1)+'</script>';
                            });

                    if(js) {
                        var list=$.isArray(js)?js:(function (arr) {
                            $.each(js,function (k) { arr.push(k); });
                            return arr;
                        })([]);

                        res=res.replace(/<\/head>/i,scriptOpen+list.join(scriptClose+scriptOpen)+scriptClose+'</head>');
                    }
                    that.save(url,res);
                });
            });

            return this;
        },

        resource: function (resource) {
            this.ajax('tools.cshtml?action=resource',{
                resource: resource.join(',')

            });
        },

        compress: function (path) {

            var that=this;

            $.each(path,function (i,url) {
                var index=url.lastIndexOf('.');
                var ext=index== -1?'.js':url.substr(index);

                if(ext==='.js') {
                    var id=url.replace(/\.js$/,'');
                    url="js/"+url;
                    $.get(url+'?'+new Date().getTime(),function (res) {
                        res=parse(replaceDefine(id,res));
                        that.save(url,res);
                    });
                } else if(ext==='.css') {
                    $.get(url+'?'+new Date().getTime(),function (res) {
                        res=res.replace(/\s*([;|\:|,|\{|\}])\s*/img,'$1').replace(/[\r\n]/mg,'')
                                .replace(/;}/mg,'}');
                        that.save(url,res);
                    });
                }

            });

            return this;
        },


        template: function (template) {
            var that=this;

            this.ajax('tools.cshtml?action=template',{
                template: template.join(',')
            });
        },

        build: function (options) {
            options.js&&this.js(options.js);
            options.html&&this.html(options.html,options.js,options.api);
            options.resource&&this.resource(options.resource);
            options.compress&&this.compress(options.compress);
            options.template&&this.template(options.template);
        }
    };

    return tools;
});