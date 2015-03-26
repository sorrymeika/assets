define(['$','bridge','./../tmpl','views.text'],function(require,exports,module) {
    var $=require('$'),
        bridge=require('bridge'),
        tmpl=require('./../tmpl'),
        view=require('./../view'),
        slice=Array.prototype.slice;


    function template(templateStr) {
        var templates=[],
            includes=[],
            record={
                _templates: {},
                templates: templates,
                includes: []
            };

        templateStr=templateStr.replace(/<include src=("|')(.+?)\1[^>]*?>/img,function($0,$1,$2) {
            var replacement='<include_'+$2+'>';
            includes.push(function() {
                return buildTemplate.call(that,$2,function(rec) {
                    record.main=record.main.replace(replacement,rec.main);
                    record.includes.push(rec);
                });
            });
            return replacement;
        });

        template=template.replace(/<script([^>]+)>([\S\s]+?)<\/script>/mgi,function(r0,r1,r2) {
            var m=r1.match(/\bid=("|')(.+?)\1/i);
            if(m) {
                record._templates[m[2]]=templates.length;
            }
            templates.push(r2);
            return '';
        });

        templates.push(template);

        $.each(templates,function(i,str) {
            templates[i]=str.replace(/\{\%include\s+(\w+)\%\}/mgi,function(r0,r1) {
                return templates[record._templates[r1]];
            });
        });

        record.main=template;
        record.template=record.templates.length?record.templates[0]:null;
        templatesRecords[url]=record;
        if(includes.length) {
            var incDfd=(includes.shift())();
            while(includes.length) {
                incDfd=incDfd.then(includes.shift());
            }
            incDfd.then(function() {
                callback&&callback(record);
                dfd.resolveWith(that,[record]);
            });
        } else {
            callback&&callback(record);
            dfd.resolveWith(that,[record]);
        }

    }

    var templatesRecords={};
    var buildTemplate=function(url,callback) {

        var that=this,
            dfd=$.Deferred(),
            record=templatesRecords[url];

        if(typeof record!=='undefined') {
            callback&&callback(record);
            dfd.resolveWith(that,[record]);

        } else
            getTemplate(url,function(template) {
                var templates=[],
                    includes=[];

                record={
                    _templates: {},
                    templates: templates,
                    includes: []
                };

                template=template.replace(/<include src=("|')(.+?)\1[^>]*?>/img,function(r0,r1,r2) {
                    var replacement='<include_'+r2+'>';
                    includes.push(function() {
                        return buildTemplate.call(that,r2,function(rec) {
                            record.main=record.main.replace(replacement,rec.main);
                            record.includes.push(rec);
                        });
                    });
                    return replacement;
                });

                template=template.replace(/<script([^>]+)>([\S\s]+?)<\/script>/mgi,function(r0,r1,r2) {
                    var m=r1.match(/\bid=("|')(.+?)\1/i);
                    if(m) {
                        record._templates[m[2]]=templates.length;
                    }
                    templates.push(r2);
                    return '';
                });

                templates.push(template);

                $.each(templates,function(i,str) {
                    templates[i]=str.replace(/\{\%include\s+(\w+)\%\}/mgi,function(r0,r1) {
                        return templates[record._templates[r1]];
                    });
                });

                record.main=template;
                record.template=record.templates.length?record.templates[0]:null;
                templatesRecords[url]=record;
                if(includes.length) {
                    var incDfd=(includes.shift())();
                    while(includes.length) {
                        incDfd=incDfd.then(includes.shift());
                    }
                    incDfd.then(function() {
                        callback&&callback(record);
                        dfd.resolveWith(that,[record]);
                    });
                } else {
                    callback&&callback(record);
                    dfd.resolveWith(that,[record]);
                }
            });

        return dfd.promise();
    };

});