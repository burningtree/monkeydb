var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out) {

        out.name = $('div#main-zahlavi h2').text;

    }
});
