var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.name = "string";
schemaObject.level = 'number';
schemaObject.parents = 'array';
schemaObject.children = 'array';
schemaObject.number = "number";

//exports.schema=schemaObject;
module.exports = schemaObject;
