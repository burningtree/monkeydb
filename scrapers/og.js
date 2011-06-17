
var nodeio = require('node.io');

exports.job = new nodeio.Job({timeout: 10}, {

    init: function() {
        this.input = this.options.args;
    },
    run: function(html) {
        this.getHtml(url, function(err, $) {
            var o = {}
            if(err) this.exit(err);

            o.name = $('meta[property="og:title"]').attribs.content;
            o.image = $('meta[property="og:image"]').attribs.content;
            o.url = $('meta[property="og:url"]').attribs.content;

            this.emit(o);
        });
    }
});
