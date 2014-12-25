﻿define(['$','util'],function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        ua=navigator.userAgent,
        ios=ua.match(/(iPhone|iPad|iPod).*OS\s([\d_]+)/i),
        android=ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        isAndroid=!!android,
        osVersion,
        slice=Array.prototype.slice,
        blankFn=function () { };

    ios&&(osVersion=ios[2].replace(/_/g,'.'));
    android&&(osVersion=android[2]);

    window.hybridFunctions={};
    window.complete=function () {
        if(ios&&queue.length!=0) {
            queue.shift();
            if(queue.length!=0) location.href=queue.shift();
        }
    };

    window.trigger=window.app_trigger=function () {
        $.fn.trigger.apply($(window),arguments);
    };

    var queue=[],funcguid=0,
        hybrid=function (method,params,hybridCallback) {

            var data={
                method: method
            },
            hybridReturn;

            hybridCallback=typeof params==="function"?params:hybridCallback;
            params=typeof params==="function"?null:params;

            data.params=params;

            if(typeof hybridCallback=="function") {
                hybridReturn="hybridCallback"+(++funcguid);

                data.callback=hybridReturn;
                hybridFunctions[hybridReturn]=function () {
                    hybridCallback.apply(null,arguments);
                    delete hybridFunctions[hybridReturn];
                };
            }

            if(bridge.isDevelopment) {
                switch(data.method) {
                    case 'exitLauncher':
                        hybridFunctions[hybridReturn]();
                        break;
                }
                return;
            }

            if(ios) {
                alert(JSON.stringify(data));
            } else if(isAndroid) {
                prompt(JSON.stringify(data));
            }
        },
        bridge={
            isAndroid: isAndroid,
            android: isAndroid,
            ios: !!ios,
            osVersion: osVersion,
            versionName: isAndroid?'1.0':"1.0",
            needRefresh: /^HUAWEI_P7/.test(ua),
            log: function (msg) {
                !this.$log&&(this.$log=$('<div style="position:absolute;overflow:hidden;height:1px;width:1px;left:0px;top:0px;margin:0;padding:0;"></div>').appendTo(document.body));

                this.$log.html(msg);
            },
            exec: hybrid,
            exitLauncher: function (f) {
                hybrid('exitLauncher',function () {
                    f&&f();
                });
            },
            tip: function (msg) {
                hybrid('tip',msg+"");
            },
            pickImage: function (f) {
                hybrid('pickImage',f);
            },
            takePhoto: function (f) {
                setTimeout(function () {
                    hybrid('takePhoto',f);
                },0);
            },
            queryThumbnailList: function (f) {
                hybrid('queryThumbnailList',f);
            },
            pickColor: function (f) {
                hybrid('pickColor',f);
            },
            share: function () {
                hybrid('share');
            },
            isDevelopment: navigator.platform=="Win32"||navigator.platform=="Win64",
            url: function (url) {
                return /^http\:\/\//.test(url)?url:navigator.platform=="Win32"||navigator.platform=="Win64"?('/assets/index.cshtml?path='+encodeURIComponent(url)):('http://photo.ie1e.com'+url);
            },
            post: function (url,data,files,callback) {
                callback=typeof files==='function'?files:callback;
                files=typeof files==='function'?null:files;

                hybrid('post',{
                    url: this.url(url),
                    files: files,
                    data: data
                },callback);
            },
            exit: function () {
                hybrid('exit');
            },
            update: function (downloadUrl,versionName,f) {
                hybrid('updateApp',{
                    downloadUrl: downloadUrl,
                    versionName: versionName
                },f);
            }
        };

    return bridge;

});