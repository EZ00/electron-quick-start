var db = require('../db');
var assert = require('assert');

exports.all = function(cb) {
  // Use the admin database for the operation
  var adminDb = db.get().admin();

  // List all the available databases
  adminDb.listDatabases(function(err, data) {
    cb(err,data);
  });
}

exports.allDbNames = function(cb) {
  // Use the admin database for the operation
  var adminDb = db.get().admin();

  // List all the available databases
  adminDb.listDatabases(function(err, data) {
    var dbNames = [];
    for(var i=0;i<data.databases.length;i++){
      dbNames.push(data.databases[i].name);
    }
    cb(err,dbNames);
  });
}

exports.allCollectionNames = function(cb){
  db.get().listCollections().toArray(function(err, items) {
    // assert.ok(items.length > 0);
    var names = [];
    for(var i=0;i<items.length;i++){
      names.push(items[i].name);
    }
    cb(err,names);
  });
}
