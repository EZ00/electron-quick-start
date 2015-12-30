var path = require("path");
const p_globals = require("p_globals");
const env = require(path.join(p_globals._dirname,"../../env.js"));
const db = require(path.join(p_globals._dirname,"../../db.js"));

db.connect(env.db_path);

// var collectionTest = db.collection("test");
// for(var i=0;i<100;i++){
//   collectionTest.insert({"name":"test","number":i,"null":null});
// }

process.stdin.resume();
