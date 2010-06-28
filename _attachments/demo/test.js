var server = new Couch.Server('http://admin:pass@localhost:5984', function() {
  // Recreate the test server
  Couch.Database.destroy(server, 'couchdb_xd_test');
  Couch.Database.create(server, 'couchdb_xd_test');

  var db = new Couch.Database(server, 'test');

  test('can create a record', function() {
    stop();
    db.put('new-record', { hello: 'world' }, function(resp) {
      start();
      equals(resp.data.hello, 'world');
    });
  });
});
