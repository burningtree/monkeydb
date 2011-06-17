var monkey = require('monkeydb-io');

exports.job = new monkey.Job({

    props: [ 'name', 'image', 'url', 'tags', 'links' ], 
    run: function($, out, utils) {
            
            out.name = $.meta('og:title');
            if(out.name == undefined){
                return;
            }
            
            out.image = $.meta('og:image');
            out.url = $.meta('og:url');

            out.tags = [];
            $('div.tags a').each( function(a){
                if(a.fulltext == 'See more') return null;
                out.tags.push(a.fulltext);
            });
            
            out.description = $('div#wikiAbstract').text || null;

            var stats = $('div#catalogueHead p.stats').text;
            out.plays = parseInt(stats.match(/([\d,]+) plays/)[1].replace(',',''));
            out.listeners = parseInt(stats.match(/\(([\d,]+) listeners\)/)[1].replace(',',''));

            var links_map = { 'Official Homepage': 'official', 
                              'Myspace': 'myspace', 
                              'MusicBrainz': 'musicbrainz' };

            // factbox
            try {
                var factbox = $('dl.factbox dd a');
                out.links = [];
                factbox.each( function(a){
                    if(a.text in links_map){
                        out.links.push(a.attribs.href);
                    }
                });
            } catch(err) { out.links = null }

            // top tracks 
            out.weekTopTracks = [];
            $('div.chartweek tr').each( function(tr){
                        var track = $('td.subjectCell a',tr);
                        out.weekTopTracks.push({
                            position: parseInt($('td.positionCell', tr).text),
                            name: track.text,
                            url: $.base_uri+track.attribs.href,
                            plays: parseInt($('td.chartbarCell span',tr).text),
                        });
                    });

            // similar artists
            out.similarArtists = [];
            $('div#similarArtists li a').each( function(a){
                out.similarArtists.push({ name: a.fulltext, url: $.base_uri + a.attribs.href });
            });

    },
});
