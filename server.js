var express = require('express'),
    monkeydb = require('./monkeydb-api.js').monkeydb;

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


app.listen(3000);
console.log('Server started.');

