var path = require("path");

var state = {
  db: null,
  manager: null
}

var collectionClass = function(p){
  this.path = p;
  this.findOne = function(){

  }
}

var dbClass = function(p){
  this.path = p;
  if(state.manager === null){
    state.manager = new managerClass(path.join(this.path,".."));
  }
  this.collection = function(colName){
    return new collectionClass(path.join(this.path,colName));
  };
  this.close = function(cb){
    cb(null,null);
  }
}

var managerClass = function(p){
  console.log("Enter managerClass")
  console.log(p);
  console.log("Leave managerClass")
}

exports.connect = function(url) {
  state.db = new dbClass(url);
  console.log("connected "+url);
}

exports.manager = function(){
  return state.manager;
}

exports.get = function() {
  return state.db;
}

exports.collection = function(colName) {
  return state.db.collection(colName);
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}
