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
            output.description = { lang: 'en', text: $('div#short-description p').fulltext };

            output.isbn = $('meta[name="book.isbn"]').attribs.content;
            output.author = $('meta[name="book.author"]').attribs.content;
            output.year = $('meta[name="book.year"]').attribs.content;

            this.emit(output);
        });
    }
});
