var nodeio = require('node.io');

exports.job = new nodeio.Job({timeout: 10}, {

    init: function() {
        this.input = this.options.args;
    },
    run: function(url) {
        this.getHtml(url, function(err, $) {
            var output = {}
            if(err) this.exit(err);

            output.name = $('h1#page-title').text;
            output.links = [];
            $('a.weblink-uri').each( function(a){
                output.links.push(a.attribs.href);
            });

            this.emit(output);
        });
    }
});
