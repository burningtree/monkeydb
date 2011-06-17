var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out, utils) {

        out.name = $.meta('og:title');
        out.url = $.meta('og:url');
        out.image = $.meta('og:image');

        out.plays = parseInt($('div.userData span.userPlays span.count').fulltext);

    }
});
