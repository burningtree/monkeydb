var monkey = require('monkeydb-io');

exports.job = new monkey.Job({
    run: function($, out){
        
        out.title = $.meta('og:title').split(' ')[0];
        out.url = $.meta('og:url');
        out.image = $.meta('og:image');
        
    }
});
