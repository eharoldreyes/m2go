/**
 * Created by eharoldreyes on 7/13/15.
 */
var simpleModel 	= require(__dirname + "/../libs/simpleModel");
var mainDB 			= require(__dirname + "/../datasources/mysql");

var tableName       = "vaults";
var alias           = "vault";
var columns         = ["id", "user_id", "vault_id", "valid_until", "state", "type", "first_name", "last_name", "number", "expire_month", "expire_year", "date_created"];
var required        = ["user_id", "vault_id", "valid_until", "state", "type", "first_name", "last_name", "number", "expire_month", "expire_year"];

var model           = simpleModel(mainDB, tableName, alias, columns, required);

module.exports      = model;