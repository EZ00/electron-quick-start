var path = require("path");
require("globals")
const env = require("../../env.js");
const db = require(path.join(env._dirname,"db.js"));

console.log(env._dirname);
db.connect(env.db_path);
