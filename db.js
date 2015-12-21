var path = require("path");

var state = {
  db: null,
  manager: null
}

var collectionClass = function(path){
  this.path = path;
  this.findOne = function(){

  }
}

var dbClass = function(path){
  this.path = path.normalize(path);
  if(state.manager === null){
    state.manager = new managerClass(path.normalize(this.path+".."));
  }
  this.collection = function(colName){
    return new collectionClass(path.join(this.path,colName));
  };
  this.close = function(cb){
    cb(null,null);
  }
}

var managerClass = function(path){

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
