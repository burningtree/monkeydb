var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out) {

        out.name = $('table#firmName h2').text;
        out.image = $('table#firmName div.leftbar div#company img').attribs.src;
        
        out.related = [];
        var relq = $('div#firmName div#firmCont a.externalLink')
        if(relq.length == undefined) {
            out.related.push(relq.attribs.href);
        } else {
            relq.each( function(a){
                out.related.push(a.attribs.href);
            });
        }

        out.address = {
            street: $('div.vcard span.street-address').text,
            zip: $('div.vcard span.postal-code').text,
            city: $('div.vcard span.locality').text,
        };

        out.phone = $('div.vcard p.tel span.value').text,
    }
});
