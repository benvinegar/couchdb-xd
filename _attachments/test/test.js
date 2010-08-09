Couch.init(function() {
  var server = new Couch.Server('http://localhost:5984', 'admin', 'pass');

  function loadFixtures(callback) {
    db.put('sample-record', { hello: 'world' }, callback);
  }

  function setup(opts, callback) {
    // Callback can either be first or second argument
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    // Recreate the test server each test
    server.get(server, 'couchdb_xd_test', function(response) {
      server.destroy(server, 'couchdb_xd_test', function(response) {
        server.create(server, 'couchdb_xd_test', function() {
          // Optionally load fixtures
          if (opts.fixtures) {
            loadFixtures(callback);
          } else {
            callback();
          }
        });
      });
    });
  }

  var db = new Couch.Database(server, 'couchdb_xd_test');
  start();

  test('can fetch a record', 1, function() {
    stop();
    setup({ fixtures: true }, function() {
      db.get('sample-record', function(resp) {
        start();
        // TODO: normalize '_id' vs 'id'
        equals(resp._id, 'sample-record');
      });
    });
  });

  // Kind of redundant, seeing as loadFixtures() creates records already, but
  // figured this should be here anyways.
  test('can create a named record (PUT)', 1, function() {
    stop();
    setup(function() {
      db.put('new-record', { hello: 'world' }, function(resp) {
        start();
        equals(resp.id, 'new-record');
      });
    });
  });

  test('can create an unnamed record (POST)', 2, function() {
    stop();
    setup(function() {
      db.post({ hello: 'world' }, function(resp) {
        start();

        equals(resp.ok, true);
        // Generated DocID is 32 char hexstring -- but might not be safe to make
        //  this assumption
        equals(resp.id.length, 32);
      });
    });
  });

  test('can update a record', 1, function() {
    stop();
    setup({ fixtures: true }, function(resp) {
      // To update an existing record, you must supply the _rev property
      db.put('sample-record', { _rev: resp.rev, hello: 'universe' }, function() {
        // Fetch that record afterwards, make sure the change took hold
        db.get('sample-record', function(resp) {
          start();
          equals(resp.hello, 'universe');
        });
      });
    });
  });

  test('can delete a record', 1, function() {
    stop();
    setup({ fixtures: true }, function(resp) {
      db.destroy('sample-record', { rev: resp.rev }, function(resp) {
        start();
        equals(resp.ok, true);
      });
    });
  });

  test('can copy a record', 1, function() {
    stop();
    setup({ fixtures: true}, function(resp) {
      db.copy('sample-record', 'new-record', { rev: resp.rev }, function() {
        // Now try to fetch the new copy
        db.get('new-record', function(resp) {
          start();
          equals(resp.hello, 'world');
        });
      });
    });
  });
});