window.Couch = (function() {
  var Couch = {};

  Couch.init = function(host) {
    Couch.host = host;

    var script = document.createElement('script');
    script.src = host + '/couchdb-xd/_design/couchdb-xd/lib/pmdxr-client.js';
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
  };

  Couch.Database = function(name) {
    this.url = Couch.host + '/' + name;
  }

  Couch.Database.prototype.get = function(name, callback) {
    var self = this;
    pmxdr.request({
      uri: self.url + '/' + name,
      callback: function(response) {
        callback(response.data);
      }
    });
  }

  return Couch;
})();