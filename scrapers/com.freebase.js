var monkey = require('monkeydb-io');

exports.job = new monkey.Job({
    run: function($, out){

        var freebase_types = {
            'film': 'Movie',
        };
        var domainbox = $('div#domain-boxes div.domain-box').first();
        out.type = freebase_types[$('h2.domain-box-title a',domainbox).attribs.name] || null;
        out.name = $('h1#page-title').text;
        out.links = [];
        $('a.weblink-uri').each( function(a){
            out.links.push(a.attribs.href);
        });
        
    }
});
