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

  Couch.Server = function(host, onready) {
    this.host = host;

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

  // TODO: Getting 401 unauthorized consistently
  Couch.Database.destroy = function(server, name, callback) {
    pmxdr.request({
      uri: server.host + '/' + name,
      method: "DELETE",
      callback: callback
    });
  };

  // TODO: Getting 401 unauthorized consistently
  Couch.Database.create = function(server, name, callback) {
    pmxdr.request({
      uri: server.host + '/' + name,
      method: "PUT",
      callback: callback
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

  return Couch;
})();