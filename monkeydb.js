var nodeio = require('node.io');
var MonkeyOutput = function() {};

var MonkeyJob = function(data){
    var options = {};
    return this.init(options, data);
}

MonkeyJob.prototype.init = function(options, data){

    var nodeJob = new nodeio.Job({timeout:10}, {
        init: function() {
                 this.input = this.options.args;
              },
        run: function(url) {
                 this.getHtml(url, function(err, $) {
                     if(err) this.exit(err);

                     var output = {};

                     $.ext = function(module, col){
                        var modules = {
                            og: {
                                params: [ 'name', 'image', 'url' ],
                                parseItem: function(column){
                                         try { 
                                            var current = $('meta[property="og:'+column+'"]').attribs.content;
                                         } catch(err) { return null; }
                                         return current;
                                      },
                                run: function(value){
                                        if(value != undefined) return this.parseItem(value);

                                        var out = {}, module = this;
                                        this.params.forEach( function(c){
                                            var i = module.parseItem(c);
                                            console.log(i);
                                            if(i) out[c] = i;
                                        });
                                        return out;
                                     },
                            },
                        };

                        try {
                            var parsed = modules[module].run(col);
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
