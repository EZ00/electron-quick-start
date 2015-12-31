var path = require("path");
const p_globals = require("p_globals")
const env = require(path.join(p_globals._dirname,"../../env.js"));
const db = require(path.join(p_globals._dirname,"../../db.js"));

db.connect(env.db_path,function(){
  var collectionTest = db.collection("test");
  collectionTest.findAndModify({'number':200}, [], {'$set':{'null':0}}, {},function(err,insertedDoc){
    if(err){
      console.log(err);
    }
    else{
      console.log(insertedDoc);
    }
  });
});

process.stdin.resume();
