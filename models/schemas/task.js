var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.title = "string";
schemaObject.content = 'string';
//schemaObject.visible = 'policy';
//schemaObject.editable = 'policy';
// legal values: active,completed,failed,potential
schemaObject.status = 'string';
schemaObject.priority = 'number';
// array of userIds
schemaObject.visibility = 'string';
schemaObject.assignee = 'array';


//exports.schema=schemaObject;
module.exports = schemaObject;
