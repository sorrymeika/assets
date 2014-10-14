define(function (require,exports,module) {
    var util={
        merge: function (first,second) {
            var i=first.length,j=0;

            if(typeof second.length==="number") {
                for(var l=second.length;j<l;j++) {
                    first[i++]=second[j];
                }

            } else {
                while(second[j]!==undefined) {
                    first[i++]=second[j++];
                }
            }

            first.length=i;

            return first;
        },
        s2i: function (s) {
            return parseInt(s.replace(/^0+/,'')||0);
        },
        pad: function (num,n) {
            var a='0000000000000000'+num;
            return a.substr(a.length-(n||2));
        },
        C: function (x,y) {
            var a=1,b=1;
            for(var i=x;i>x-y;i--) {
                a*=i;
            }
            for(var i=1;i<=y;i++) {
                b*=i;
            }
            return a/b;
        },
        A: function (x,y) {
            var a=1;
            for(var i=x;i>x-y;i--) {
                a*=i;
            }
            return a;
        },
        formatDate: function (d,f) {
            if(typeof d=="string"&&/^\/Date\(\d+\)\/$/.test(d)) {
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
        makeArray: function (array,results) {
            var ret=results||[];

            if(array!=null) {

                var type=$.type(array);

                if(array.length==null||type==="string"||type==="function"||type==="regexp"||$.isWindow(array)) {
                    push.call(ret,array);
                } else {
                    core.merge(ret,array);
                }
            }
            return ret;
        },
        addStyle: function (css) {
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
        stringify: function (o) {
            var r=[];
            if(typeof o=="string")
                return quote(o);
            if(typeof o=="undefined")
                return "undefined";
            if(typeof o=="function")
                return "";
            if(typeof o=="object") {
                if(o===null)
                    return "null";
                else if(Object.prototype.toString.call(o)!="[object Array]") {
                    for(var i in o)
                        r.push(arguments.callee(i)+":"+arguments.callee(o[i]));
                    r="{"+r.join()+"}";
                } else {
                    for(var i=0;i<o.length;i++)
                        r.push(arguments.callee(o[i]));
                    r="["+r.join()+"]";
                }
                return r;
            }
            return o.toString();

            function quote(string) {
                var escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                var meta={
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"': '\\"',
                    '\\': '\\\\'
                };
                escapable.lastIndex=0;
                return escapable.test(string)?'"'+string.replace(escapable,function (a) {
                    var c=meta[a];
                    return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);
                })+'"':'"'+string+'"';
            }
        },
        parse: function (str) {
            return (new Function("return "+str))()
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
        }
    };

    return util;
})