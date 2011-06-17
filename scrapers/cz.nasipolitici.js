var monkey = require('monkeydb-io');

exports.job = new monkey.Job({
    run: function($, out){

        out.name = $('div#main h2.biggerFont.red').text;
        out.url = $('div#politicianMenu a').first().attribs.href;

        // birthday, birthplace
        var birth = $('div#main span.birth').text.match(/^\* (\d{1,2}\.\s*\d{1,2}\.\s*\d{4})(, (.+)|)/);
        out.birthday = birth ? birth[1].replace(/\s+/g, '') : null;
        out.birthplace = (birth && birth[3]) ? birth[3].trim() : null;
        out.description = $('div#politicianDetail p').fulltext.trim() || null;

        try { out.image = $.base_uri + $('div#politicianDetail img').attribs.src;
        } catch(err) { out.image = null; }

        try { out.codexApproved = ($('div#functionMenu span.ethCodeLights').attribs['class'].split(' ')[1] == 'yes');
        } catch(err) { out.codexApproved = null }

        try { out.updated = $('div#politicianInfo div[rel="cv"] p').fulltext.match(/Aktualizováno ke dni (\d{2}\.\d{2}\.\d{4})/)[1];
        } catch(err) { out.updated = null }
        
    }
});
