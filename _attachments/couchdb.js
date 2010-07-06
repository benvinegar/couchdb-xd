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

  Couch.Server = function(host, onready, user, pass) {
    this.host = host;
    this.user = user;
    this.pass = pass;

    var script = document.createElement('script');
    script.src = host + '/couchdb-xd/_design/couchdb-xd/lib/pmdxr-client.js';
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
    var interval = setInterval(function() {
      if (typeof pmxdr !== 'undefined') {
        clearInterval(interval);
        onready();
      }
    }, 100);
  };

  Couch.Server.prototype = {
    getDatabase: function(name) {
      return new Couch.Database(this, name);
    }
  };

  Couch.Database = function(server, name) {
    this.name = name;
    this.url = server.host + '/' + name;
  };

  Couch.Database.get = function(server, name, callback) {
    pmxdr.request({
      uri: server.host + '/' + name,
      method: "GET",
      callback: callback,
      headers: {
        'Authorization': "Basic " + Base64.encode(server.user + ':' + server.pass)
      }
    });
  };

  Couch.Database.destroy = function(server, name, callback, rev) {
    pmxdr.request({
      uri: server.host + '/' + name,
      method: "DELETE",
      callback: callback,
      headers: {
        'Authorization': "Basic " + Base64.encode(server.user + ':' + server.pass)
      }
    });
  };

  Couch.Database.create = function(server, name, callback) {
    pmxdr.request({
      uri: server.host + '/' + name,
      method: "PUT",
      callback: callback,
      headers: {
        'Authorization': "Basic " + Base64.encode(server.user + ':' + server.pass)
      }
    });
  };

  Couch.Database.prototype = {
    get: function(name, callback) {
      var self = this;
      pmxdr.request({
        uri: self.url + '/' + name,
        callback: callback
      });
    },

    put: function(name, data, callback) {
      var self = this;
      pmxdr.request({
        uri: self.url + '/' + name,
        method: "PUT",
        data: JSON.stringify(data),
        callback: callback
      });
    }
  };


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

  	// public method for decoding
  	decode : function (input) {
  		var output = "";
  		var chr1, chr2, chr3;
  		var enc1, enc2, enc3, enc4;
  		var i = 0;

  		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  		while (i < input.length) {

  			enc1 = this._keyStr.indexOf(input.charAt(i++));
  			enc2 = this._keyStr.indexOf(input.charAt(i++));
  			enc3 = this._keyStr.indexOf(input.charAt(i++));
  			enc4 = this._keyStr.indexOf(input.charAt(i++));

  			chr1 = (enc1 << 2) | (enc2 >> 4);
  			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
  			chr3 = ((enc3 & 3) << 6) | enc4;

  			output = output + String.fromCharCode(chr1);

  			if (enc3 != 64) {
  				output = output + String.fromCharCode(chr2);
  			}
  			if (enc4 != 64) {
  				output = output + String.fromCharCode(chr3);
  			}

  		}

  		output = Base64._utf8_decode(output);

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
  	},

  	// private method for UTF-8 decoding
  	_utf8_decode : function (utftext) {
  		var string = "";
  		var i = 0;
  		var c = c1 = c2 = 0;

  		while ( i < utftext.length ) {

  			c = utftext.charCodeAt(i);

  			if (c < 128) {
  				string += String.fromCharCode(c);
  				i++;
  			}
  			else if((c > 191) && (c < 224)) {
  				c2 = utftext.charCodeAt(i+1);
  				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
  				i += 2;
  			}
  			else {
  				c2 = utftext.charCodeAt(i+1);
  				c3 = utftext.charCodeAt(i+2);
  				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
  				i += 3;
  			}

  		}

  		return string;
  	}
  };

  return Couch;
})();