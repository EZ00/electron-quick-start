var path = require("path");
var fse = require("fs-extra");
var __ = require("underscore");
var crypto = require('crypto');
var algo = 'sha256';

var state = {
  db: {},
  manager: null,
  loaded: false,
  currentDb: null,
  dataPath: null
}
var loadDocs = function(collectionName,docsPath,cb){
  fse.readdir(docsPath,function(err,files){
    if(err){
      cb(err)
    }
    else if(files.length===0){
      this.cb(null);
    }
    else{
      var count = 0;
      state.db[collectionName] = [];
      for(var i=0;i<files.length;i++){
        var filePath = path.join(this.docsPath,files[i]);
        fse.readJson(filePath, function(err, packageObj) {
          if(err){
            this.cb(err);
          }
          else{
            state.db[collectionName].push(packageObj);
            // console.log(packageObj);
            count += 1;
            // console.log(files.length,"===",count);
            if(files.length===count){
              // console.log(this.docs);
              this.cb(null);
            }
          }
        }.bind({"cb":cb}))
      }
    }
  }.bind({'docsPath':docsPath,'cb':cb}))
}
var cursorClass = function(p,query){
  this.parts = path.parse(p);
  this.toArray = function(cb){
    console.log(this.parts.name);
    cb(null,state.db[this.parts.name]);
  };
}
var collectionClass = function(colName){
  var p = path.join(state.dataPath,state.currentDb+".db",colName+".col");
  console.log(p);
  this.path = p;
  this.parts = path.parse(p);
  this.name = this.parts.name;
  this.docsPath = path.join(this.path,"docs");
  if(!state.db[this.parts.name]){
    state.db[this.parts.name] = [];
  }
  // fse.ensureDir(this.docsPath, function (err) {
  //   if(err){
  //     console.log(err) // => null
  //   }
  // })
  this.insert = function(newDoc,cb){
    var jsonString = JSON.stringify(newDoc);
    var shasum = crypto.createHash(algo);
    shasum.update(jsonString);
    var d = shasum.digest('hex');
    var newDocPath = path.join(this.docsPath,d);
    fse.outputFile(newDocPath, jsonString,{"flag":"wx"},function (err) {
      if (err) {
        cb(err,null);
      }
      else{
        // console.log('It\'s saved!',newDocPath);
        state.db[this.name].push(this.newDoc);
        cb(null,newDoc);
      }
    }.bind({"name":this.parts.name,"newDoc":newDoc}));
  };
  this.findOne = function(query,cb){
    var props = Object.getOwnPropertyNames(query);
    var matched = 0;
    for(var i=0;i<state.db[this.name].length;i++){
      for(var j=0;j<props.length;j++){
        if(state.db[this.name][i][props[j]] === query[props[j]]){
          matched += 1;
        }
      }
      if(matched === props.length){
        cb(null,state.db[this.name][i]);
        return true;
      }
    }
    cb(null,null);
  };
  this.find = function(query){
    return new cursorClass(this.path,query);
  };
  this.update = function(){};
  this.findAndModify = function(query, sort, doc, options, cb){
    //sort
    var $set = doc['$set'];
    var $inc = doc['$inc'];
    if($set){
      $inc = false;
    }
    var props = Object.getOwnPropertyNames(query);
    var matched = 0;
    for(var i=0;i<state.db[this.name].length;i++){
      for(var j=0;j<props.length;j++){
        if(state.db[this.name][i][props[j]] === query[props[j]]){
          matched += 1;
        }
      }
      if(matched === props.length){
        var returnDoc = __.clone(state.db[this.name][i]);
        if($set){
          var setProps = Object.getOwnPropertyNames($set);
          for(var k=0;k<setProps.length;k++){
            state.db[this.name][i][setProps[k]] = $set[setProps[k]];
          }
        }
        if($inc){
          var incProps = Object.getOwnPropertyNames($inc);
          for(var k=0;k<incProps.length;k++){
            state.db[this.name][i][incProps[k]] += $inc[incProps[k]];
          }
        }
        if(options['new']){
          cb(null,state.db[this.name][i]);
        }
        else{
          cb(null,returnDoc);
        }
        return true;
      }
    }
    if(options['upsert']){
      if($set){
        var insertDoc = $set;
      }
      else if($inc){
        var insertDoc = $inc;
      }
      this.insert(insertDoc,function(err,doc){
        cb(err,doc);
        return true;
      })
    }
    cb(null,null);
  };
  this.remove = function(){};
  this.createIndex = function(){
  };
}

var dbClass = function(p){
  if(p.substr(-3,3) !== ".db"){
    console.error("db path is not correct, it should end with .db");
  }
  this.path = p;
  if(state.manager === null){
    state.manager = new managerClass(path.join(this.path,".."));
  }

  this.collection = function(colName){
    return new collectionClass(path.join(this.path,colName+".col"));
  };
  this.collectionNames = function(){
    console.log("Enter collectionNames",this.path);
    fse.readdir(this.path,function(files,err){
      if(err){
        console.error(err);
      }
      else{
        // console.log(files);
        return files;
      }
    })
  };
  this.collectionPaths = function(){};
  this.close = function(cb){
    cb(null,null);
  }
  // this.collectionNames();
  // this.collectionPaths();
}

var managerClass = function(p){
  console.log("Enter managerClass")
  console.log(p);
  this.path = p;
  console.log("Leave managerClass")
}

exports.connect = function(url,cb) {
  var parts = path.parse(url);
  console.log(parts);
  if(parts.ext !== ".db"){
    console.log("error: database name should end with .db");
  }
  state.dataPath = parts.dir;
  state.currentDb = parts.name;
  //load all collections from this db
  fse.readdir(url,function(err,files){
    if(err){
      this.cb(err);
    }
    else{
      console.log(files);
      var colCount = 0;
      for(var i=0;i<files.length;i++){
        var colParts = path.parse(files[i]);
        if(colParts.ext === ".col"){
          var docsPath = path.join(url,files[i],"docs");
          console.log(i);
          loadDocs(colParts.name,docsPath,function(err){
            if(err){
              this.cb(err);
            }
            else{
              colCount += 1;
              console.log(colCount,files.length);
              if(colCount === files.length){
                state.loaded = true;
                this.cb(null);
              }
            }
          }.bind(this));
          // console.log(docsPath);
        }
      }
      // return files;
    }
  }.bind({"cb":cb}))
  // state.db = new dbClass(url);
}

exports.manager = function(){
  return state.manager;
}

exports.get = function() {
  return state.db;
}

exports.collection = function(colName) {
  return new collectionClass(colName);
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
