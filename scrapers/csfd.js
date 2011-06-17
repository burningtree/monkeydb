var nodeio = require('node.io');

exports.job = new nodeio.Job({timeout: 10}, {

    init: function() {
        this.input = this.options.args;
    },
    run: function(url) {
        this.getHtml(url, function(err, $) {
            var output = {}
            if(err) this.exit(err);

            output.name = $('h1').text;
            try { output.official_url = $('ul.links a.www').attribs.href; } catch(err) {}
            output.image = $('meta[property="og:image"]').attribs.content;

            output.imdb_url = $('ul.links a.imdb').attribs.href;
            output.rating = $('div#rating h2.average').text;
            output.genre = $('p.genre').text.split(' / ');

            var params = $('p.origin').text.split(', ');
            output.country = params[0].split(' / ');
            output.year = params[1];
            output.duration = params[2];

            $('div.info div').each( function(el) {
                var map = { 'Režie:': 'director', 'Hrají:': 'actors' };
                var col = $('h4', el).text;
                if(col in map){
                    var anchors = $('span a', el);
                    var push_anchors = function(a){
                        if(output[map[col]] == undefined) output[map[col]] = [];
                        output[map[col]].push({ 
                            name: a.text,
                            url: a.attribs.href,
                        });
                    };
                    if(anchors.length>0) { anchors.each(push_anchors); } else { push_anchors(anchors); }
                }
            });

            var multicontent = $('div.content ul');
            if(multicontent)
            {
                output.description = { lang: 'cs', text: $('div', multicontent).first().fulltext };
            }

            try {
            output.comments = []
            $('ul.ui-posts-list li').each(function(div) {
                output.comments.push({
                    text: $('p.post', div).text,
                    author: {
                        name: $('h5.author a', div).text,
                        url: $('h5.author a', div).attribs.href,
                    },
                    created: $('p.post span.date.desc', div).text.slice(1,-1),
                });
            });
            } catch(err) {}

            this.emit(output);
        });
    }
});
