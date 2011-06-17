var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out) {
        var name = $('meta[property="og:title"]').attribs.content.match(/^(.+) \((\d+)\)$/);
        out.name = name[1];
        out.year = name[2] || null;

        out.image = $('meta[property="og:image"]').attribs.content;
        out.url = $('meta[property="og:url"]').attribs.content;
        
        out.links = [];
        $('div#zakladni_info div.right div.text a').each( function(a){
            if(a.text == 'imdb.com' || a.text == 'HDmag.cz')
                out.links.push(a.attribs.href);
        });
    }
});
