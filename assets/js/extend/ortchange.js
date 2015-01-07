define('extend/ortchange',['$','extend/matchMedia'],function(require,exports,module) {
    var $=require('$');

    require('extend/matchMedia');

    $(function() {
        $.mediaQuery={
            ortchange: 'screen and (width: '+window.innerWidth+'px)'
        };
        $.matchMedia($.mediaQuery.ortchange).addListener(function() {
            $(window).trigger('ortchange');
        });
        $.matchMedia('screen and (height: '+window.innerHeight+'px)').addListener(function() {
            this.append('screen and (height: '+window.innerHeight+'px)');
            $(window).trigger('heightchange');
        });
    });
});
