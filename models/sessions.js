/**
 * Created by eharoldreyes on 7/13/15.
 */
var simpleModel 	= require(__dirname + "/../libs/simpleModel");
var mainDB 			= require(__dirname + "/../datasources/mysql");

var tableName       = "sessions";
var alias           = "session";
var columns         = ["id", "user_id", "access_token", "ip_address", "created"];
var required        = ["user_id", "access_token", "ip_address"];
var model           = simpleModel(mainDB, tableName, alias, columns, required);

model.nestTables = true;
model.selectQuery = "SELECT"
    + " user.*"
    + " FROM sessions session"
    + " LEFT JOIN users user ON user.id = session.user_id AND user.status = 'verified' ";
model.filterJoin = function (row) {
    var user = row.user;
    delete user.password;
    return user;
};
module.exports      = model;
