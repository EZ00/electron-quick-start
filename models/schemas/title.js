var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.title = "string";
schemaObject.keywords = 'array';
schemaObject.aid = 'string';
schemaObject.priority = 'number';


//exports.schema=schemaObject;
module.exports = schemaObject;
