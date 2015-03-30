define(['$'],function (require,exports,module) {
    var $=require('$'),
        slice=Array.prototype.slice;

    //'f@(data(")").a["asdfasdf"](a))'.match(/([^@]|^)@(?![@])(html|ajax|)([\w\d]+(?:\[\"[^\"]+\"\]|\.[\w\d]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+)?\))/mg)

    //'@for(var i=0;i<n;i++){ if(){} if(){ if(){if(){}} } } <div>}'.match(/([^@]|^)@(?![@])(for|if|each)\(([^\)]+?)\)\s*\{((?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}])+|.+?)\}/);

    //^\{\}]+?\{[^\}]*\}[^\{\}]*|[^\}]*

    var expReg=/([^@]|^)@(?![@])(?:(for|if|each)\(([^\)]+?)\)\s*){0,1}\{((?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}])+|.+?)\}/mg;

    var paramReg=/([^@]|^)@(?![@])(html|ajax|)([\w\d]+(?:\[(?:\"[^\"]+\"|\w+?)\]|\.[\w\d]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+?)\))/mg;

    var tagReg=/<(\w+)(?:\s+[^>]+)*>(.*?)<\/\1>/img;

    $.encodeHTML=function (text) {
        return (""+text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
    }

    function template(templateStr,data) {

        templateStr=templateStr.replace(/\\/g,'\\\\')
            .replace(/'/g,'\\\'')
            .replace(expReg,function (text,pre,cmd,exp,code) {
                code=code.replace(/\\'/,'\'')
                    .replace(/[\r\n\t]/g,' ')
                    .replace(tagReg,function (text,tag,html) {
                        return "__.push('"+(tag=='text'?html:text)+"')";
                    });

                if(cmd=='each') {
                    code='$.each('+exp.replace(/\,/,',function(')+'){'+code+'});';
                } else if(cmd) {
                    code=cmd+'('+exp+'){'+code+'}';
                }

                return pre+'\');'+
                        code
                    +'__.push(\'';
            })
            .replace(paramReg,function (text,pre,cmd,code) {
                code=code.replace(/\\'/,'\'');
                return pre+'\','+(cmd=="html"?code:'$.encodeHTML('+code+')')+',\'';
            })
            .replace(/\r/g,'\\r')
            .replace(/\n/g,'\\n')
            .replace(/\t/g,'\\t');

        var parsed_markup_data="var __=[]; with($data){__.push('"+templateStr+"');}return __;",
            fn=new Function("$data",parsed_markup_data);

        console.log(parsed_markup_data);

        return data?fn(data):fn;
    }

    template('<div></div>\
    @for(var i=0;i<data.length;i++){\
        <div>@(data[i].name)</div>\
    }\
    @{ adsf="\'"; } @each(data,i,item){ }')

    module.exports=template;
});