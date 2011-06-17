var nodeio = require('node.io');

exports.job = new nodeio.Job({timeout: 10}, {

    init: function() {
        this.input = this.options.args;
    },
    run: function(url) {
        this.getHtml(url, function(err, $) {
            var output = {}
            if(err) this.exit(err);

            output.name = $('meta[property="og:title"]').attribs.content;
            output.image = $('meta[property="og:image"]').attribs.content;
            output.url = $('meta[property="og:url"]').attribs.content;
            output.description = $('meta[name="description"]').attribs.content;

            output.tomatometer = $('span#all-critics-meter').text;
            output.popcorn = $('span.meter.popcorn.numeric').text;

            output.director = []; output.writer = [];
            var map = { "Directed By:": "director", "Written By": "writer" };
            $('div.movie_info div.left_col p').each( function(p){
                if(p.children[0] && p.children[0].name == 'label'){
                    var type = map[p.children[0].children[0].raw];
                    console.log(type);
                    if(type != undefined)
                        output[type].push( { name: $('a', p).fulltext, url: $('a',p).attribs.href } );
                }
            });

            this.emit(output);
        });
    }
});
