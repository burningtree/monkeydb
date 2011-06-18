var nodeio = require('node.io'),
    Url = require('url');

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
            if(i) out[c] = i;
        });
        return out;
    },
    meta: function($, column){
             try { 
                var current = $('meta[property="'+column+'"]').attribs.content;
             } catch(err) { return null; }
             return current;
          },

};

var MonkeyOutput = function() {};
var MonkeyJob = function(data){
    var options = {};
    return this.init(options, data);
}

MonkeyJob.prototype.init = function(options, data){

    var proc_options = {
        silent: true,
        timeout: 10,
    }
    var nodeJob = new nodeio.Job(proc_options, {
        init: function() {
                 if(this.options.args == undefined || this.options.args.length == 0){
                    this.exit('Input argument not defined');
                 }
                 //console.log(this.options);
                 this.input = this.options.args;
              },
        run: function(url) {
                 this.getHtml(url, function(err, $) {
                     if(err) this.emit(err);

                     if($ == undefined)
                        return this.emit(null);

                     var output = {};

                     $.ext = function(module, col){
                        try {
                            var parsed = monkeyParserExts[module]($, col);
                        } catch(err) { return err; }

                        return parsed;
                     };
                     $.meta = function(column){
                        return monkeyParserExts.meta($, column);
                     }

                     $.prototype.type = function(callback){
                        return self.each(callback);
                     };

                     var parsed_uri = Url.parse(url);
                     $.base_uri = parsed_uri.protocol + '//' + parsed_uri.hostname;

                     try {
                        data.run($, output, this);
                     } catch(err) { 
                         console.log(err);
                        return this.emit(null);
                     }
                     return this.emit(output);
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
