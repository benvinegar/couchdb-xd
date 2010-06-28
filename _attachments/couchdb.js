/**
 *---------------------------------------------------------------
 * CouchDB cross-domain client library
 *---------------------------------------------------------------
 *
 * Example Usage:
 *  var server = new Couch.Server('http://myserver.com');
 *  var db = server.getDatabase('test');
 *  db.get('document-name', function(doc) { alert(doc); });
 *
 * Copyright Ben Vinegar http://benv.ca
 */

window.Couch = (function() {
  var Couch = {};

  Couch.Server = function(host) {
    this.host = host;

    var script = document.createElement('script');
    script.src = host + '/couchdb-xd/_design/couchdb-xd/lib/pmdxr-client.js';
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
  };

  Couch.Server.prototype = {
    getDatabase: function(name) {
      return new Couch.Database(this, name);
    }
  };

  Couch.Database = function(server, name) {
    this.name = name;
    this.url = server.host + '/' + name;
  }

  Couch.Database.prototype = {
    get: function(name, callback) {
      var self = this;
      pmxdr.request({
        uri: self.url + '/' + name,
        callback: function(response) {
          callback(response.data);
        }
      });
    },

    put: function(name, data, callback) {
      var self = this;
      pmxdr.request({
        uri: self.url + '/' + name,
        method: "PUT",
        data: JSON.stringify(data),
        callback: function(response) {
          callback(response.data);
        }
      });
    }
  };

  return Couch;
})();