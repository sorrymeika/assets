define('app',['util'],function(require,exports,module) {

    var util=require('util'),
        isiPhone=/iPhone/.test(navigator.userAgent),
        isAndroid=/Android/.test(navigator.userAgent),
        slice=Array.prototype.slice,
        blankFn=function() { };

    window.callbackfunctions={};
    window.complete=function() {
        if(isiPhone&&queue.length!=0) {
            queue.shift();
            if(queue.length!=0) location.href=queue.shift();
        }
    };

    var queue=[],funcguid=0,stringify=util.stringify,
        appFunc=function(method,params,callback) {

            var data={
                method: method
            },result;

            if(typeof params!="undefined") {
                var tmp=callback;
                if(typeof params=='function') {
                    callback=params;
                    params=tmp;
                }
                if(typeof params!="undefined")
                    data.params=params;

                if(typeof callback!="undefined") {
                    var funcName="mycallback"+(++funcguid),
                        f=callback;
                    data.callback=funcName;
                    callbackfunctions[funcName]=function() {
                        f.apply(null,arguments);
                        delete callbackfunctions[funcName];
                    };
                }
            }

            if(data.method=="post") {
                result={};
                if(data.params.files) {
                    result.abort=function() {
                        if(window.callbackfunctions[data.callback])
                            window.callbackfunctions[data.callback]=blankFn;
                    };

                } else {
                    result.xhr=$.ajax({
                        url: data.params.url,
                        data: data.params.data,
                        type: 'POST',
                        dataType: 'json',
                        success: function(res) {
                            console.log(res);
                            window.callbackfunctions[data.callback](res);
                        },
                        error: function(res) {
                            window.callbackfunctions[data.callback]({ success: false,msg: '网络错误' });
                        }
                    });
                    result.abort=function() {
                        result.xhr.abort();
                        if(window.callbackfunctions[data.callback])
                            window.callbackfunctions[data.callback]=blankFn;
                    };
                    return result;
                }
            }

            if(false||navigator.platform=="Win32"||navigator.platform=="Win64") {
                switch(data.method) {
                    case 'onload':
                        window.callbackfunctions[data.callback]();
                        break;

                    case "selectimage":
                        window.callbackfunctions[data.callback]({
                            path: "asdfsf",
                            src: "asdfsf"
                        });
                        return;
                }
                return;
            }

            if(isiPhone) {
                var url='abschinajuicejs:a?'+encodeURIComponent(stringify(data));
                queue.push(url);
                if(queue.length==1) {
                    location.href=url;
                }
            } else if(isAndroid) {
                prompt(stringify(data));
            }
            return result;
        };

    var isDebug=false;

    return {
        isAndroid: isAndroid,
        versionName: isAndroid?'1.0':"1.0",
        exec: appFunc,
        load: function(f) {
            appFunc('onload',function() {
                f&&f();
            });
        },
        tip: function(msg) {
            appFunc('tip',msg+"");
        },
        selectImage: function(f) {
            appFunc('selectimage',f);
        },
        selectColor: function(f) {
            appFunc('colorpicker',f);
        },
        share: function() {
            appFunc('share');
        },
        isDevelopment: navigator.platform=="Win32"||navigator.platform=="Win64",
        url: function(url) {
            return /^http\:\/\//.test(url)?url:navigator.platform=="Win32"||navigator.platform=="Win64"?'/assets/Index.cshtml?path='+encodeURIComponent(url):('http://ms1.962666.com'+url);
        },
        post: function() {
            var args=slice.call(arguments),
                i=0,
                cache=args[i++],
                url=typeof cache!=='string'?args[i++]:cache,
                data=i>=args.length?null:args[i++],
                files=null,
                callback;

            if(typeof data=='function') {
                callback=data;
                data=null;
            } else {
                files=i>=args.length?null:args[i++];
                if(typeof files=='function') {
                    callback=files;
                    files=null;
                } else
                    callback=args[i];
            }

            var postData={
                url: this.url(url)
            }

            if(data) postData.data=data;
            if(files) postData.files=files;

            return appFunc('post',postData,function(res) {
                if(cache===true) {
                    if(!res) {
                        var str=localStorage[url+"_"+(postData.data&&postData.data.page?postData.data.page:1)];
                        res=str?util.parse(str):null;
                    } else {
                        localStorage[url+"_"+(postData.data&&postData.data.page?postData.data.page:1)]=util.stringify(res);
                    }
                }
                callback(res);
            });
        },
        exit: function() {
            appFunc('exit');
        },
        update: function(downloadUrl,versionName,f) {
            appFunc('updateApp',{
                downloadUrl: downloadUrl,
                versionName: versionName
            },f);
        }
    };

});
