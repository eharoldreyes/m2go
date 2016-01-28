/**
 * Created by eharoldreyes on 7/13/15.
 */
var simpleModel 	= require(__dirname + "/../libs/simpleModel");
var mainDB 			= require(__dirname + "/../datasources/mysql");

var tableName       = "users";
var alias           = "user";
var columns         = ["id", "role", "first_name", "last_name", "phone", "email", "password", "status", "address", "city", "zipcode", "country", "referrer_id", "date_modified", "date_created"];
var required        = ["role", "first_name", "last_name", "phone", "email", "password", "status", "date_modified"];

var model           = simpleModel(mainDB, tableName, alias, columns, required);

model.nestTables = true;
model.selectQuery   = "SELECT " +
    "user.*, " +
    "referrer.* " +
    "FROM users AS user " +
    "LEFT JOIN users AS referrer ON referrer.id = user.referrer_id ";

model.filterJoin    = function (row) {
    var user = row.user;
    if(row.referrer.id !== null) user.referrer = row.referrer;
    delete user.password;
    return user;
};

module.exports      = model;