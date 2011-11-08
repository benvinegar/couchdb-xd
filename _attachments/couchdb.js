/**
 *---------------------------------------------------------------
 * CouchDB cross-domain client library
 *---------------------------------------------------------------
 *
 * Example Usage:
 *  var server = new Couch.Server('http://myserver.com');
 *  var db = server.getDatabase('test');
 *
 *  // Fetch a document
 *  db.get('document-name', function(doc) { alert(doc); });
 *
 *  // Create a new document
 *  db.put('new-document-name', { mydata: true });
 *
 * Copyright Ben Vinegar http://benv.ca
 */

window.Couch = (function() {
  var Couch = {};

  Couch.init = function(onready) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var tag = scripts[i];
      if (typeof tag.src !== 'string' ||
          tag.src.indexOf('couchdb.js') === -1)
      {
        continue;
      }

      var script = document.createElement('script');
      script.src = tag.src.replace(/couchdb\.js/, 'lib/pmdxr-client.js');
      script.async = true;
      var body = document.getElementsByTagName('body')[0];
      body.appendChild(script);
      var interval = setInterval(function() {
        if (typeof pmxdr !== 'undefined') {
          clearInterval(interval);
          onready();
        }
      }, 100);
    }
  };

  /**
   * CouchDB server object; exposes database-level instance methods
   */
  Couch.Server = function(host, user, pass) {
    this.host = host;
    this.user = user;
    this.pass = pass;

  };

  Couch.Server.prototype = {

    request: function(url, params) {
      params.uri = this.host + '/' + url;
      if (params.data) {
        // If we're not doing a POST or PUT, params should be placed
        // on query string instead. This should probably be done inside
        // the pmxdr lib.
        if (params.method != 'POST' && params.method != 'PUT') {
          var queryParams = [];
          for (var k in params.data) {
            queryParams.push(k + '=' + params.data[k]);
          }
          params.uri += '?' + queryParams.join('&');
          delete(params.data);
        } else {
          params.data = JSON.stringify(params.data);
        }
      }

      // HTTP Basic Authentication
      if (typeof this.user === 'string') {
        if (!params.headers) {
          params.headers = {};
        }
        params.headers['Authorization'] =
          "Basic " + Base64.encode(this.user + ':' + this.pass);
      }

      // Wrap supplied callback method; deserialize successful response
      // first
      var callback = params.callback;
      params.callback = function(resp) {
        if (resp.status >= 200 && resp.status < 300) {
          callback(JSON.parse(resp.data));
        } else {
          callback(resp);
        }
      };
      pmxdr.request(params);
    },

    get: function(server, name, callback) {
      server.request(name, {
        method: "GET",
        callback: callback
      });
    },

    destroy: function(server, name, callback, rev) {
      server.request(name, {
        method: "DELETE",
        callback: callback
      });
    },

    create: function(server, name, callback) {
      server.request(name, {
        method: "PUT",
        callback: callback
      });
    }
  };

  /**
   * CouchDB database object; exposes document-level instance methods
   */

  Couch.Database = function(server, name) {
    this.server = server;
    this.name = name;
  };

  Couch.Database.prototype = {
    request: function(name, params) {
      this.server.request(this.name + '/' + name, params);
    },

    get: function(name, callback) {
      this.request(name, {
        callback: callback
      });
    },

    put: function(name, data, callback) {
      this.request(name, {
        method: "PUT",
        data: data,
        callback: callback
      });
    },

    post: function(data, callback) {
      this.request('', {
        method: 'POST',
        data: data,
        contentType: 'application/json',
        callback: callback
      });
    },

    destroy: function(name, data, callback) {
      this.request(name, {
        method: "DELETE",
        data: data,
        callback: callback
      });
    },

    // Right now data should only contain 'rev'. Should the third
    // parameter just be 'rev'?
    copy: function(source, dest, data, callback) {
      this.request(source, {
        method: 'COPY',
        callback: callback,
        data: data,
        headers: {
          Destination: dest
        }
      });
    }
  }


  /**
  *
  *  Base64 encode / decode
  *  http://www.webtoolkit.info/
  *
  **/

  var Base64 = {

  	// private property
  	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  	// public method for encoding
  	encode : function (input) {
  		var output = "";
  		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  		var i = 0;

  		input = Base64._utf8_encode(input);

  		while (i < input.length) {

  			chr1 = input.charCodeAt(i++);
  			chr2 = input.charCodeAt(i++);
  			chr3 = input.charCodeAt(i++);

  			enc1 = chr1 >> 2;
  			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
  			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
  			enc4 = chr3 & 63;

  			if (isNaN(chr2)) {
  				enc3 = enc4 = 64;
  			} else if (isNaN(chr3)) {
  				enc4 = 64;
  			}

  			output = output +
  			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
  			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

  		}

  		return output;
  	},

  	// private method for UTF-8 encoding
  	_utf8_encode : function (string) {
  		string = string.replace(/\r\n/g,"\n");
  		var utftext = "";

  		for (var n = 0; n < string.length; n++) {

  			var c = string.charCodeAt(n);

  			if (c < 128) {
  				utftext += String.fromCharCode(c);
  			}
  			else if((c > 127) && (c < 2048)) {
  				utftext += String.fromCharCode((c >> 6) | 192);
  				utftext += String.fromCharCode((c & 63) | 128);
  			}
  			else {
  				utftext += String.fromCharCode((c >> 12) | 224);
  				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
  				utftext += String.fromCharCode((c & 63) | 128);
  			}

  		}

  		return utftext;
  	}
  };

  return Couch;
})();