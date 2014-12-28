define(function () {
    var ArrayProto=Array.prototype,
        push=ArrayProto.push,
        slice=ArrayProto.slice,
        concat=ArrayProto.concat;

    var indexOf=function (array,key,compareItem) {
        if(typeof compareItem==='undefined') {
            compareItem=key;
            key=null;
        };
        var result= -1,
            value;
        $.each(array,function (i,item) {
            value=key!==null?item[key]:item;

            if(compareItem===value) {
                result=i;
                return false;
            }
        });
        return result;
    };

    var lastIndexOf=function (array,key,compareItem) {
        if(typeof compareItem==='undefined') {
            compareItem=key;
            key=null;
        };
        var result= -1,
            value;

        for(var i=array.length-1;i>=0;i--) {
            var item=array[i];
            value=key!==null?item[key]:item;

            if(compareItem===value) {
                result=i;
                break;
            }
        }

        return result;
    };

    var util={
        indexOf: indexOf,
        lastIndexOf: lastIndexOf,

        pick: function (obj,iteratee) {
            var result={},key;
            if(obj==null) return result;
            if(typeof iteratee==='function') {
                for(key in obj) {
                    var value=obj[key];
                    if(iteratee(value,key,obj)) result[key]=value;
                }
            } else {
                var keys=concat.apply([],slice.call(arguments,1));
                for(var i=0,length=keys.length;i<length;i++) {
                    key=keys[i];
                    if(key in obj) result[key]=obj[key];
                }
            }
            return result;
        },
        s2i: function (s) {
            return parseInt(s.replace(/^0+/,'')||0);
        },
        pad: function (num,n) {
            var a='0000000000000000'+num;
            return a.substr(a.length-(n||2));
        },

        formatDate: function (d,f) {
            if(typeof d==="string"&&/^\/Date\(\d+\)\/$/.test(d)) {
                d=new Function("return new "+d.replace(/\//g,''))();
            }

            var y=d.getFullYear()+"",M=d.getMonth()+1,D=d.getDate(),H=d.getHours(),m=d.getMinutes(),s=d.getSeconds(),mill=d.getMilliseconds()+"0000",pad=this.pad;
            return (f||'yyyy-MM-dd HH:mm:ss').replace(/\y{4}/,y)
                .replace(/y{2}/,y.substr(2,2))
                .replace(/M{2}/,pad(M))
                .replace(/M/,M)
                .replace(/d{2,}/,pad(D))
                .replace(/d/,d)
                .replace(/H{2,}/i,pad(H))
                .replace(/H/i,H)
                .replace(/m{2,}/,pad(m))
                .replace(/m/,m)
                .replace(/s{2,}/,pad(s))
                .replace(/s/,s)
                .replace(/f+/,function (w) {
                    return mill.substr(0,w.length)
                })
        },
        style: function (css) {
            var doc=document,style=doc.createElement("style");
            style.type="text/css";
            try {
                style.appendChild(doc.createTextNode(css));
            } catch(ex) {
                style.styleSheet.cssText=css;
            }
            var head=doc.getElementsByTagName("head")[0];
            head.appendChild(style);

            return style;
        },

        template: function (str,data) {
            var tmpl='var __p=[];var $data=obj||{};with($data){__p.push(\''+
                str.replace(/\\/g,'\\\\')
                .replace(/'/g,'\\\'')
                .replace(/<%=([\s\S]+?)%>/g,function (match,code) {
                    return '\','+code.replace(/\\'/,'\'')+',\'';
                })
                .replace(/<%([\s\S]+?)%>/g,function (match,code) {
                    return '\');'+code.replace(/\\'/,'\'')
                            .replace(/[\r\n\t]/g,' ')+'__p.push(\'';
                })
                .replace(/\r/g,'\\r')
                .replace(/\n/g,'\\n')
                .replace(/\t/g,'\\t')+
                '\');}return __p.join("");',

            func=new Function('obj',tmpl);

            return data?func(data):func;
        },

        cookie: function (a,b,c,p) {
            if(typeof b==='undefined') {
                var res=document.cookie.match(new RegExp("(^| )"+a+"=([^;]*)(;|$)"));
                if(res!=null)
                    return unescape(res[2]);
                return null;
            } else {
                if(typeof b===null) {
                    b=this.cookie(name);
                    if(b!=null) c= -1;
                    else return;
                }
                if(c) {
                    var d=new Date();
                    d.setTime(d.getTime()+c*24*60*60*1000);
                    c=";expires="+d.toGMTString();
                }
                document.cookie=a+"="+escape(b)+(c||"")+";path="+(p||'/')
            }
        },
        store: window.localStorage?function (key,value) {
            if(typeof value==='undefined')
                return JSON.parse(localStorage.getItem(key));
            if(value===null)
                localStorage.removeItem(key);
            else
                localStorage.setItem(key,JSON.stringify(value));
        } :function () {
            if(typeof value==='undefined')
                return JSON.parse(this.cookie(key));
            if(value===null)
                this.cookie(key,null);
            else
                this.cookie(key,JSON.stringify(value));
        },
        noop: function () { },

        validateEmail: function (email) {
            return /^[-_a-zA-Z0-9\.]+@([-_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,3}$/.test(email)
        },
        validateMobile: function (str) {
            return /^1[0-9]{10}$/.test(str)
        }
    };

    return util;
})