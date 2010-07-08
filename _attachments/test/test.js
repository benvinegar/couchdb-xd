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
        var data = JSON.parse(resp.data);
        equals(data.id, 'new-record');
      });
    });
  });

  test('can fetch a record', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function() {
        db.get('new-record', function(resp) {
          start();
          var data = JSON.parse(resp.data);
          // TODO: normalize '_id' vs 'id'
          equals(data._id, 'new-record');
        });
      });
    });
  });

  test('can delete a record', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function(resp) {
        var data = JSON.parse(resp.data);
        db.destroy('new-record', { rev: data.rev }, function(resp) {
          start();
          var data = JSON.parse(resp.data);
          equals(data.ok, true);
        });
      });
    });
  });
}, 'admin', 'pass');
