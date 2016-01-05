var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.keyword = "string";
schemaObject.title = 'string';
schemaObject.priority = 'number';


//exports.schema=schemaObject;
module.exports = schemaObject;
