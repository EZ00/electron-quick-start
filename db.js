var path = require("path");
var fse = require("fs-extra");
var crypto = require('crypto');
var algo = 'sha256';

var state = {
  db: null,
  manager: null
}
var cursorClass = function(p){
  var toArray = function(){};
}
var collectionClass = function(p){
  this.path = p;
  this.docsPath = path.join(this.path,"docs");
  this.docs = [];
  this.inited = false;
  fse.readdir(this.docsPath,function(err,files){
    //console.log(files);
    // this.count = files.length;
    var count = 0;
    for(var i=0;i<files.length;i++){
      var filePath = path.join(this.docsPath,files[i]);
      fse.readJson(filePath, function(err, packageObj) {
        if(err){
          console.log(err);
        }
        else{
          this.docs.push(packageObj);
          // console.log(packageObj);
          count += 1;
          console.log(files.length,"===",count);
          if(files.length===count){
            // console.log(this.docs);
            this.inited = true;
          }
        }
      }.bind(this))
    }
  }.bind(this))
  this.insert = function(newDoc){
    var jsonString = JSON.stringify(newDoc);
    var shasum = crypto.createHash(algo);
    shasum.update(jsonString);
    var d = shasum.digest('hex');
    var newDocPath = path.join(this.docsPath,d);
    fse.outputFile(newDocPath, jsonString,{"flag":"wx"},function (err) {
      if (err) {
        console.log(err);
      }
      else{
        console.log('It\'s saved!',newDocPath);
        this.docs.push(newDoc);
      }
    });
  };
  this.findOne = function(){
  };
  this.find = function(query){
    return new cursorClass(p);
  };
  this.update = function(){};
  this.findAndModify = function(){};
  this.remove = function(){};
  this.createIndex = function(){
  };
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
  this.path = p;
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
