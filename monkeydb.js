var nodeio = require('node.io');

var monkeyParserExts = {
    og: function($, value){

        var params = [ 'name', 'image', 'url' ];
        var parseItem = function(column){
                 try { 
                    var current = $('meta[property="og:'+column+'"]').attribs.content;
                 } catch(err) { return null; }
                 return current;
              };

        if(value != undefined) return parseItem(value);

        var out = {}
        params.forEach( function(c){
            var i = parseItem(c);
            console.log(i);
            if(i) out[c] = i;
        });
        return out;
    },
};

var MonkeyOutput = function() {};
var MonkeyJob = function(data){
    var options = {};
    return this.init(options, data);
}

MonkeyJob.prototype.init = function(options, data){

    var nodeJob = new nodeio.Job({timeout:10}, {
        init: function() {
                 if(this.options.args == undefined || this.options.args.length == 0){
                    this.exit('Input argument not defined');
                 }

                 this.input = this.options.args;
              },
        run: function(url) {
                 this.getHtml(url, function(err, $) {
                     if(err) this.exit(err);

                     var output = {};

                     $.ext = function(module, col){

                        try {
                            var parsed = monkeyParserExts[module]($, col);
                        } catch(err) { return err; }

                        return parsed;
                     };

                     try {
                        data.run($, output, this);
                     } catch(err) { 
                        return this.exit(err);
                     }
                     this.emit(output);
                 });
             },
    });

    return nodeJob;
}

exports = module.exports = {
    Job: MonkeyJob,
}

exports.monkey = {
}
