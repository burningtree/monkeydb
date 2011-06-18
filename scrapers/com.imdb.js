var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out) {

        out.url = $.meta('og:url');

        var name = $.meta('og:title').match(/^(.+) \((\d+)\)$/);
        out.name = name[1];
        out.year = name[2] || null;

        out.image = $.meta('og:image');

    }
});
