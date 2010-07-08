var server = new Couch.Server('http://localhost:5984', function() {
  // Recreate the test server
  Couch.Database.get(server, 'couchdb_xd_test', function(response) {
    Couch.Database.destroy(server, 'couchdb_xd_test', function(response) {
      Couch.Database.create(server, 'couchdb_xd_test', begin);
    });
  });
}, 'admin', 'pass');

function begin() {
  start();
  var db = new Couch.Database(server, 'couchdb_xd_test');

  asyncTest('can create a record', 1, function() {
    db.put('new-record', { hello: 'world' }, function(resp) {
      start();
      var data = JSON.parse(resp.data);
      equals(data.id, 'new-record');
    });
  });
}