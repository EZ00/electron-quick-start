var path = require("path");
const p_globals = require("p_globals")
const env = require(path.join(p_globals._dirname,"../../env.js"));
const db = require(path.join(p_globals._dirname,"../../db.js"));

db.connect(env.db_path,function(){
  var collectionTest = db.collection("test");
  collectionTest.findOne({"number":100},function(err,doc){
    if(err){console.error(err);}
    else{
      console.log(doc);
    }
  });
});
process.stdin.resume();
