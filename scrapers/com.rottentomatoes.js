var monkey = require('monkeydb-io');

exports.job = new monkey.Job({
    run: function($, output) {

        output.name = $('meta[property="og:title"]').attribs.content;
        output.url = $('meta[property="og:url"]').attribs.content;
        output.image = $('meta[property="og:image"]').attribs.content;
        output.description = $('meta[name="description"]').attribs.content;

        output.tomatometer = parseInt($('span#all-critics-meter').text);
        output.popcorn = parseInt($('span.meter.popcorn.numeric').text);

        output.director = []; output.writer = [];
        var map = { "Directed By:": "director", "Written By": "writer" };
        $('div.movie_info div.left_col p').each( function(p){
            if(p.children[0] && p.children[0].name == 'label'){
                var type = map[p.children[0].children[0].raw];
                if(type != undefined)
                    output[type].push( { name: $('a', p).fulltext, url: $.base_uri+$('a',p).attribs.href } );
            }
        });
    }
});
