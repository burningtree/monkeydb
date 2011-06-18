var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    run: function($, out, utils) {

        parseLastFmDate = function(string){
            var m = string.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
            return m[1]+'-'+m[2]+'-'+m[3]+' '+m[4]+':'+m[5];
        };

        out.name = $('h1.summary').text;
        out.url = $.meta('og:url');
        out.image = $.meta('og:image');
        out.links = [];
        out.links.push($('h3.website a').attribs.href);

        out.lineup = [];
        $('div#lineup ul.festivalLineup a').each(function(a){
            var obj = { name: a.attribs.title, url: $.base_uri+a.attribs.href, image: img };
            try { 
                var img = $('img', a).attribs.src;
                obj.image = img;
            } catch(err) {}
            out.lineup.push(obj);
        });

        out.startDate = parseLastFmDate($('div#details abbr.dtstart').attribs.title);
        out.endDate = parseLastFmDate($('div#details abbr.dtend').attribs.title);

    }
});
