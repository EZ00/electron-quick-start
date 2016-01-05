var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.name = "string";
schemaObject.ext = "string";
//schemaObject.visible = 'policy';
//schemaObject.editable = 'policy';
// legal values: active,completed,failed,potential
schemaObject.sha256 = 'string';
schemaObject.size = 'number';
schemaObject.type = 'string';

//exports.schema=schemaObject;
module.exports = schemaObject;
