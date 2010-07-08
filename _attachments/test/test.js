var server = new Couch.Server('http://localhost:5984', function() {
  function setup(callback) {
    // Recreate the test server each test
    Couch.Database.get(server, 'couchdb_xd_test', function(response) {
      Couch.Database.destroy(server, 'couchdb_xd_test', function(response) {
        Couch.Database.create(server, 'couchdb_xd_test', callback);
      });
    });
  }

  var db = new Couch.Database(server, 'couchdb_xd_test');
  start();

  test('can create a record', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function(resp) {
        start();
        equals(resp.id, 'new-record');
      });
    });
  });

  test('can fetch a record', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function() {
        db.get('new-record', function(resp) {
          start();
          // TODO: normalize '_id' vs 'id'
          equals(resp._id, 'new-record');
        });
      });
    });
  });

  test('can delete a record', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function(resp) {
        db.destroy('new-record', { rev: resp.rev }, function(resp) {
          start();
          equals(resp.ok, true);
        });
      });
    });
  });
}, 'admin', 'pass');
