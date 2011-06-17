var express = require('express'),
    nodeio = require('node.io'),
    mongo = require('mongoskin'),
    url = require('url'),
    jquery = require('jquery'),
    jsdom = require('jsdom');

var base_url = 'http://95.168.199.246:3000/';
var db = mongo.db('localhost:27017/monkeydb');

/*db.collection('uri_templates').find().toArray( function(err, templates){
        console.log(templates);
});*/
Array.prototype.contains = function(obj) {
      var i = this.length;
        while (i--) {
                if (this[i] === obj) {
                          return true;
                              }
                  }
          return false;
}

Array.prototype.unique = function () {
    var r = new Array();
    o:for(var i = 0, n = this.length; i < n; i++)
    {
        for(var x = 0, y = r.length; x < y; x++)
        {
                if(r[x]==this[i])
                {
                        continue o;
                }
        }
        r[r.length] = this[i];
    }
    return r;
}

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function Monkey(obj)
{
    obj.summary = function(){
        return {
            id: obj._id,
            url: base_url+obj._id,
            type: obj.type,
            name: obj.name,
            links: obj.uri,
            redirects: obj.redirects,
            sources: obj.sources.map( function(source) { return { 
                            uri: source.uri, 
                            scraper: base_url+'scrape?uri='+encodeURIComponent(source.uri),
                            ns: source.ns,
                            params: source.args,
                            props: source.props,
                            status: source.status,
                            milis: source.milis,
                            updated: source.updated,
                     }; }),
            image: obj.image,
            description: obj.description,
            created: obj.created,
            updated: obj.updated,
        };
    };
    return obj;
}

var monkeydb = {

    detectNamespace: function(uri, callback){
                         var parsed_uri = url.parse(uri);
                         if(!parsed_uri.protocol || !parsed_uri.hostname) return callback('Bad URI');

                         var regexBase = new RegExp('^'+RegExp.escape(parsed_uri.protocol) + '//' + RegExp.escape(parsed_uri.hostname) +'.*');
                         db.collection('namespaces').find({ 'uri': { $regex: regexBase }, }).toArray(function(err, arr){
                             if(err) return callback(err);
                             if(arr == undefined) return callback(null);

                             var curns = null;
                             arr.forEach(function(ns){
                                 var regex = ns.uri.replace(/<([^>]+)>/g, function(val, match){
                                     return '('+String(ns.regex[match]).replace(/^\/(.*)\/$/,"$1")+')';
                                 });
                                 regex = new RegExp('^'+regex+'$');
                                 var match = uri.match(regex);
                                 if(match){
                                    curns = ns;
                                    curns.compiledRegex = regex;
                                    curns.args = {}; var i = 1;
                                    for(prop in ns.regex){
                                        curns.args[prop] = match[i];
                                        i++;
                                    }
                                 }
                             });

                             return callback(err, curns);
                         }); 
                     },
    object: function(arg, callback){

                        // hledame ObjectId
                        if(typeof(arg) == 'string' && arg.match(/^[a-f0-9]{24}$/))
                        {
                            db.collection('objects').findById(arg, function(err,row){
                                    if(err) return callback(err);
                                    if(row == undefined) return callback('No results');
                                    callback(err, Monkey(row));
                            });

                        // hledame podle uri
                        } else {
                            var curargs = [];
                            if(arg.constructor == Array) {
                                curargs = arg;
                            } else {
                                curargs = [ arg ];
                            }

                            db.collection('objects').findOne({ 'uri': { '$in': curargs }}, function(err,row){
                                    if(err) return callback(err);
                                    if(row == undefined){
                                        // try find a redirect
                                        db.collection('objects').findOne({ 'sources.redirects': { '$in': curargs }}, function(err, subrow){
                                            if(subrow == undefined)
                                                return callback('No results');

                                            return callback(err, Monkey(subrow));

                                        });
                                    } else { callback(err, Monkey(row)); }
                            });
                        }
                     },

    insert: function(uri, callback){

                monkeydb.scrapeObject(uri, function(err, object, data, source){
                    if(err)
                        return callback(err);

                    // zkusime najit jeste prolinkovane
                    monkeydb.object(source.data.uri, function(err, obj){

                        if(obj != undefined)
                        {
                            monkeydb.updateSource(obj, source, function(){
                                callback(err, Monkey(obj));
                            });

                        } else {
                            db.collection('objects').insert(object, function(err) {
                                if(err)
                                    return callback(err);

                                //return callback(err, Monkey(object));
                                callback(err, Monkey(object));
                            });
                        }
                    });
                });
            },


    updateSource: function(object, source, callback)
                  {
                        var sources = []; 
                        var modified = false;

                        object.sources.forEach( function(s){
                            if(s.uri == source.uri){
                                sources.push(source);
                                modified = true;
                            } else {
                                sources.push(s);
                            }
                        });
                        if(!modified)
                            sources.push(source);

                        var uris = [];
                        var names = [];
                        var type = null;
                        sources.forEach(function(s){
                            uris = uris.concat(s.data.uri);
                            if(type == null && s.data.type != undefined)
                                type = s.data.type;

                            var name = s.data.name;
                            if(!names.contains(name))
                                names.push(s.data.name);
                        }); 

                        if(object.sources == sources)
                            return callback(null, Monkey(object));

                        var redirects = object.redirects || [];
                        source.redirects.forEach( function(r){
                            redirects = redirects.concat(r);
                        });

                        o = object;
                        o.name = names[0];
                        o.sources = sources;
                        o.updated = new Date;
                        o.uri = uris.unique();
                        o.type = type;
                        o.redirects = redirects.unique();

                        db.collection('objects').update({ '_id': object._id }, o, function(err) {
                            if(err)
                                return callback(err);
                            callback(err, Monkey(o));
                        });
                  },

    scrapeObject: function(uri, callback){

                var scrapeStart = new Date;

                this.detectNamespace(uri, function(err, ns){
                       if(ns == undefined) return callback('Namespace for this URI not found');
                       if(err) return callback(err);

                       monkeydb.scrape(ns.scraper, [ uri ], function(err, data){
                                if(err)
                                    return callback(err);
                                
                                if(!data)
                                    return callback('no data');

                                data = data[0];
                                if(!data)
                                    return callback('no data');

                                var myuri = (data.url || uri);
                                var uris = [ myuri ];
                                if(data.url && (!data.url in uris)) uris.push(data.url);

                                var uricols = [ 'links' ];
                                if(uricols) uricols.forEach(function(col){
                                    if(data[col] == undefined) return false;

                                    if(typeof(data[col]) == 'object' && data[col].constructor == Array)
                                    {
                                        uris = uris.concat(data[col]);
                                    }
                                    else
                                        uris.push(data[col]);
                                });

                                var scrapeEnd = new Date;

                                console.log('scrape: '+uri+' ['+(scrapeEnd-scrapeStart)+' ms]');

                                var props = []
                                for(var prop in data){
                                    if(data.hasOwnProperty(prop))
                                        props.push(prop);
                                }
                                var source = {
                                        ns: ns._id,
                                        args: ns.args, 
                                        uri: myuri,
                                        status: 'ok',
                                        props: props,
                                        data: {
                                            name: data.name,
                                            type: (data.type || ns.type || null),
                                            image: data.image,
                                            description: data.description,
                                            uri: uris,
                                        },
                                        scraper: ns.scraper,
                                        milis: (scrapeEnd-scrapeStart),
                                        updated: new Date,
                                        redirects: (data.url != undefined && data.url != uri) ? [ uri ] : [], 
                                };

                                var object = {
                                    '_id': null,
                                    name: data.name,
                                    type: ns.type,
                                    sources: [ source ],
                                    uri: uris,
                                    created: new Date,
                                    redirects: source.redirects,
                                };

                                callback(err, object, data, source);

                           }); 
                });

                },

    update: function(object, uri, callback){

                monkeydb.scrapeObject(uri, function(err, scrapedObject, data, source){
                    if(err)
                        return callback(err);

                    monkeydb.updateSource(object, source, function(err){
                        callback(err, Monkey(o));
                    });
                });
            },

    detect: function(uri, callback){

                        // first try find in database
                        this.object(uri, function(err, object) {

                            console.log('detect "'+ uri +'"');

                            // not in database
                            if(object == undefined)
                            {
                                monkeydb.insert(uri, callback);
                                return;
                            }
                            // in database
                            var curtime = new Date;
                            var timeout = 5000; // (1000*3600);
                            if(curtime-object.updated < timeout)
                                return callback(null, object);

                            monkeydb.update(object, uri, function(err, data){
                                if(err)
                                    return callback(null, object);
                                
                                callback(null, data);
                            });
                            //callback(null, object);
                        });
                    },
    api: function(args, code, error, data, callback, dataName, startTime){
                    var output = {
                        status: {
                            code: code,
                        },
                    }
                    if(args) output.status.args = args;
                    if(error) output.status.error = error;

                    if(startTime != undefined)
                    {
                        var endTime = new Date;
                        output.status.milis = endTime - startTime;
                    }

                    if(dataName == undefined) dataName = 'data';
                    if(data)
                    {
                        if(data.summary)
                        {
                            data = data.summary();
                        }
                        output[dataName] = data;
                    }

                    callback(output);
               },

    scrape: function(scraperName,args, callback){

                var proc_options = {
                    silent: true,
                    args: args,
                };
                nodeio.start('scrapers/'+scraperName+'.js', proc_options, function(err,res) { 
                        callback(err, res);
                }, true);
            },
    
};

var app = express.createServer();

app.get('/lookup', function(req, res){

    var startTime = new Date;
    var uri = req.query.uri;

    monkeydb.detect(uri, function(err, object){
            monkeydb.api({ 'uri': uri }, err ? 400 : 200, err, object, function(output){
                res.send(output);
            },'object',startTime);
    });
});

app.get('/scrape', function(req, res){

    var startTime = new Date;
    var uri = req.query.uri;

    monkeydb.scrapeObject(uri, function(err, object, data){
            monkeydb.api({ 'uri': uri }, err ? 400 : 200, err, data, function(output){
                res.send(output);
            },'data',startTime);
    });
});

app.get(/\/([0-9a-f]{24})/, function(req, res){
    var id = req.params[0];
    var startTime = new Date;
        
    monkeydb.object(id, function(err, object){
        monkeydb.api({ 'id': id }, err ? 400 : 200, err, object, function(output){
            res.send(output);
        },'object',startTime);
    });
});

app.get('/templates', function(req, res){
    db.collection('uri_templates').find().toArray( function(err, templates){
        res.send(templates);
    });
});

app.get('/objects', function(req, res){
    db.collection('objects').find().toArray( function(err, objs){
        res.send(objs.map( function(obj) { return { id: obj._id, url: base_url+obj._id, type: obj.type, name: obj.name }; }));
    });
});

app.listen(3000);
console.log('Server started.');

