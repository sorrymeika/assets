define('views/allTypes',['zepto','util'],function(require,exports,module) {
    var $=require('zepto'),
        util=require('util');

    var texts='鼠 牛 虎 兔 龙 蛇 马 羊 猴 鸡 狗 猪'.split(' '),
        east61Texts={};

    $.each(texts,function(i,text) {
        east61Texts[util.pad(i+1)]=text;
    });

    var types={
        //双色球
        t_10001: [{
            type: '00|01',
            name: '单式',
            total: '1',
            balls: '$6$1',
            red: '$0',
            blue: '$1'
        },{
            type: '00|02',
            name: '复式',
            total: '$C($0,$0-6)*$1',
            balls: '$',
            red: '$0',
            blue: '$1'
        },{
            type: '00|03',
            name: '胆拖',
            total: '$C($1,6-$0)*$2',
            balls: '$',
            red: '$0($1)',
            blue: '$2'
        }],
        //3d
        t_10002: [{
            type: '01|01',
            name: '单式',
            total: '1',
            balls: '$3',
            red: '$0',
            maxTimes: 99
        },{
            type: '01|02',
            name: '复式',
            total: '$0*$1*$2',
            balls: '$',
            red: '($0)($1)($2)'
        },{
            type: '02|01',
            name: '组3单式',
            total: '1',
            balls: '$3',
            red: '$0'
        },{
            type: '02|06',
            name: '组3复式',
            total: '$A($0,2)',
            balls: '$',
            red: '$0'
        },{
            type: '03|06',
            name: '组6',
            total: '$C($0,3)',
            balls: '$',
            red: '$0'
        }],
        //福彩6+1
        t_90016: [{
            type: '00|01',
            name: '单式',
            total: '1',
            balls: '$6$1',
            red: '$0',
            blue: '$1',
            blueTextArray: east61Texts
        },{
            type: '00|02',
            name: '复式',
            total: '$0*$1*$2*$3*$4*$5*$6',
            balls: '$',
            red: '($0)($1)($2)($3)($4)($5)',
            blue: '$6',
            blueTextArray: east61Texts
        }],
        t_10003: [{
            type: '00|01',
            name: '单式',
            total: '1',
            balls: '$7',
            red: '$0'
        },{
            type: '00|02',
            name: '复式',
            total: '$C($0,$0-7)',
            balls: '$',
            red: '$0'
        },{
            type: '00|03',
            name: '胆拖',
            total: '$C($1,7-$0)',
            balls: '$',
            red: '($0)$1'
        }],
        //快3
        t_32003: [{
            type: '01|01',
            name: '和值',
            total: '1',
            balls: '$1',
            red: '$0'
        },{
            type: '01|02',
            name: '复式和值',
            total: '$0',
            balls: '$',
            red: '$0'
        },{
            type: '03|01',
            name: '三同号单选',
            total: '1',
            balls: '$1',
            red: '$0'
        },{
            type: '02|01',
            name: '三同号通选',
            total: '1',
            balls: '$0',
            red: '三同号通选'
        },{
            type: '05|01',
            name: '二同号单选',
            total: '1',
            balls: '$3',
            red: '$0'
        },{
            type: '04|02',
            name: '二同号复选',
            total: '$0',
            balls: '$',
            red: '$0',
            textArray: { '01': '11*','02': '22*','03': '33*','04': '44*','05': '55*','06': '66*' }
        },{
            type: '06|01',
            name: '三不同号',
            total: '1',
            balls: '$3',
            red: '$0'
        },{
            type: '06|02',
            name: '三不同号复选',
            total: '$C($0,3)',
            balls: '$',
            red: '$0'
        },{
            type: '07|02',
            name: '二不同号',
            total: '$C($0,2)',
            balls: '$',
            red: '$0',
            getSubmitCodes: function(codes) {
                var balls=[],
                    num=util.s2i(codes.substr(0,2));

                codes=codes.substr(2);
                console.log(num,codes);

                codes.replace(/\d{2}/g,function(r1) {
                    balls.push(r1);
                    return '';
                });

                var result='';
                for(var i=0;i<balls.length-1;i++) {

                    for(var j=i+1;j<balls.length;j++) {
                        result+=util.pad(balls[i])+util.pad(balls[j]);
                    }
                }

                return util.pad(util.C(num,2))+result;
            }
        },{
            type: '08|01',
            name: '三连号通选',
            total: '1',
            balls: '$1',
            red: '三连号通选'
        }],
        //15选5
        t_90015: [{
            type: '00|01',
            name: '单式',
            total: '1',
            balls: '$5',
            red: '$0',
            maxTimes: 99
        },{
            type: '00|02',
            name: '复式',
            total: '$C($0,$0-5)',
            balls: '$',
            red: '$0'
        },{
            type: '00|03',
            name: '胆拖',
            total: '$C($1,5-$0)',
            balls: '$',
            red: '($0)$1'
        }]
    };

    return types;
});
