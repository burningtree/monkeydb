var monkey = require('monkeydb');

exports.job = new monkey.Job({
    run: function($, out){

        out.name = $('h1#page-title').text;
        out.links = [];
        $('a.weblink-uri').each( function(a){
            out.links.push(a.attribs.href);
        });
    }
});
