var nodeio = require('node.io');

exports.job = new nodeio.Job({timeout: 10}, {

    init: function() {
        this.input = this.options.args;
    },
    run: function(url) {
        this.getHtml(url, function(err, $) {
            var output = {}
            if(err) this.exit(err);

            var name = $('meta[property="og:title"]').attribs.content.match(/^(.+) \((\d+)\)$/);
            output.name = name[1];
            output.year = name[2] || null;

            output.image = $('meta[property="og:image"]').attribs.content;
            output.url = $('meta[property="og:url"]').attribs.content;
            
            output.links = [];
            $('div#zakladni_info div.right div.text a').each( function(a){
                if(a.text == 'imdb.com' || a.text == 'HDmag.cz')
                    output.links.push(a.attribs.href);
            });

            this.emit(output);
        });
    }
});