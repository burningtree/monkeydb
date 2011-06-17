var monkey = require('monkeydb');

exports.job = new monkey.Job({

    run: function($, out) {
            
            out.name = $.ext('og', 'title');
            out.image = $.ext('og', 'image');
            out.url = $.ext('og', 'url');

            out.tags = [];
            $('div.tags a').each( function(a){
                out.tags.push(a.fulltext);
            });

            out.otherurl = []
            var links = { 'Official Homepage': 'official', 'Myspace': 'myspace', 'MusicBrainz': 'musicbrainz' };

            try {
                $('dl.factbox dd a').each( function(a){
                    if(a.text in links) out.otherurl.push(a.attribs.href);
                });
            } catch(err) {}
    },

    author: 'Jan Stransky',

});
