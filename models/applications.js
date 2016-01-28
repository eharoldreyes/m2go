/**
 * Created by eharoldreyes on 7/13/15.
 */
var simpleModel 	= require(__dirname + "/../libs/simpleModel");
var mainDB 			= require(__dirname + "/../datasources/mysql");

var tableName       = "applications";
var alias           = "application";
var columns         = ["id", "user_id", "name", "namespace", "description", "phone", "website", "email", "status", "date_modified", "date_created"];
var required        = ["user_id", "name", "namespace", "description", "phone", "website", "email", "status", "date_modified"];

var model           = simpleModel(mainDB, tableName, alias, columns, required);

module.exports      = model;