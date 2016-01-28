/**
 * Created by haroldreyes on 7/18/15.
 */
var createMySQLWrap     = require("mysql-wrap");
var async               = require("async");
var _                   = require('underscore');

var simpleModel = function (connection, tableName, alias, columns, required) {
    var self            = {};

    self.sqlWrap        = createMySQLWrap(connection);
    self.selectQuery    = "SELECT " + alias + ".* FROM " + tableName + " " + alias + " ";
    self.nestTables     = false;
    self.filterJoin     = undefined;

    /*
        Checks the json object if the property matches required array of keys.
     */
    self.checkRequiredFields = function (json, keys) {
        var missing = [];
        keys.forEach(function (key){
            if(json[key] === undefined){
                missing.push(key);
            }
        });
        return missing;
    };

    /*
        Removes unnecessary properties to an object based to the column array keys provided.
     */
    self.escape = function (input){
        var obj = {};
        columns.forEach(function (key){
            if(input[key] != undefined) obj[key] = input[key];
        });
        return obj;
    };

    /*
        Validates the input object by method "checkRequiredFields" and "escape".
     */
    self.validate = function (input){
        var missing = self.checkRequiredFields(input, required);
        if(missing.length > 0) {
            return { error: true, statusCode:403, message: "Missing fields.", missing: missing};
        } else {
            var obj = { error: false, statusCode:200, message: "Valid fields."};
            obj[alias] =  self.escape(input);
            return obj;
        }
    };

    /*
        Inserts new object to the mysql database with input validation.
     */
    self.save = function (input, callback) {
        if(Array.isArray(input)){
            self.saveBulk(input, callback);
        } else {
            if(_.isEmpty(input))
                return callback(undefined, {statusCode:403, message:"Missing new " + alias + " to create."});
            var validationResult = self.validate(input);
            if(validationResult.error == true){
                callback(undefined, validationResult);
            } else {
                var objToInsert = validationResult[alias];
                self.sqlWrap.insert(tableName, objToInsert).then(
                    function (result) {
                        objToInsert.id = result.insertId;
                        callback(objToInsert, undefined);
                    }, function (error) {
                        callback(undefined, error);
                    }
                );
            }
        }
    };

    /*
        Inserts array of new objects to the mysql database with input validation.
     */
    self.saveBulk = function (inputs, callback) {
        var toInsert = [], hasError = false, error;
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var validationResult = self.validate(input);
            if (validationResult.error == true) {
                hasError = true;
                error = validationResult;
                break;
            } else {
                toInsert.push(input);
            }
        }
        if(hasError == true){
            callback(undefined, error);
        } else {
            self.sqlWrap.insert(tableName, toInsert).then(
                function (result) {
                    callback(result, undefined);
                }, function (error) {
                    callback(undefined, error);
                }
            );
        }
    };

    /*
        Retrieves pagination details of the query.
     */
    self.getPagination = function (query, page, limit, callback){
        var queryString = "SELECT COUNT(*) as total_entries FROM " + tableName + " " + alias + " ";
        if(self.selectQuery && self.selectQuery.startsWith("SELECT "))
            queryString = "SELECT COUNT(*) as total_entries, " + self.selectQuery.slice(7);
        if(query)
            queryString += query;
        self.sqlWrap.query({ sql : queryString }).then(
            function (result) {
                var total_entries = result[0].total_entries;
                var pagination = {
                    page: page,
                    total_entries: total_entries,
                    limit: limit,
                    total_page: Math.ceil(total_entries / limit)
                };
                callback(pagination, null);
            }, function (error) {
                callback(null, error);
            }
        );
    };

    /*
        Retrieves all the instance of an objects from the database that matches the query.
     */
    self.find = function (query, callback) {
        var q = {
            sql : self.selectQuery,
            nestTables: self.nestTables
        };
        if(query) q.sql += query;
        self.sqlWrap.query(q).then(
            function (rows){
                if(rows.length > 0){
                    var objects = [];
                    if(self.filterJoin !== undefined && self.nestTables === true){
                        rows.forEach(function (row) {
                            objects.push(self.filterJoin(row));
                        });
                    } else {
                        objects = rows;
                    }
                    callback(objects, null);
                } else {
                    callback(null, {statusCode: 404, message:"No " + tableName + " found."});
                }
            }, function (error){
                callback(null, error);
            }
        );
    };

    /*
        Retrieves one instance of an object from the database that matches the query.
     */
    self.findOne = function (query, callback) {
        self.find(query, function (rows, error) {
            if(error){
                callback(undefined, error);
            } else if (rows && rows.length > 0){
                callback(rows[0], undefined);
            } else {
                callback(undefined, {statusCode:404, message:"Not found."});
            }
        });
    };

    /*
        Retrieves all the instance of an objects from the database that matches the query with pagination.
     */
    self.findPaginated = function (query, page, limit, mainCallback, customQuery){
        var objects = [];
        var pagination = {};
        async.series([
            function (callback) {
                var q = {
                    sql: customQuery || self.selectQuery,
                    nestTables: self.nestTables,
                    paginate: {
                        page: page,
                        resultsPerPage: limit
                    }
                };
                if(query) q.sql += query;
                self.sqlWrap.query(q).then(
                    function (rows) {
                        if(self.filterJoin !== undefined && self.nestTables === true){
                            rows.forEach(function (row) {
                                objects.push(self.filterJoin(row));
                            });
                        } else {
                            objects = rows;
                        }
                        callback();
                    }, function (error) {
                        callback(error);
                    }
                );
            }, function (callback){
                self.getPagination(query, page, limit, function (result, error){
                    if(error){
                        callback(error);
                    } else {
                        pagination = result;
                        callback();
                    }
                });
            }
        ], function (error) {
            if(error){
                mainCallback(undefined, error);
            } else {
                var result = {pagination:pagination};
                result[tableName] = objects;
                mainCallback(result, undefined);
            }
        });
    };

    /*
        Updates the object in the database that matches the query.
     */
    self.update = function (object, input, mainCallback) {
        var newObject = {};
        if(_.isEmpty(input))
            return mainCallback(undefined, {statusCode:403, message:"Missing new " + alias + " to update."});
        async.series([
            function (callback) {
                self.sqlWrap.update(tableName, self.escape(input), object).then(
                    function (result) {
                        if(result.affectedRows > 0){
                            callback();
                        } else {
                            callback({statusCode: 403, message: "Nothing was updated."});
                        }
                    },
                    function (error) {
                        callback(error);
                    }
                );
            }, function (callback) {
                self.sqlWrap.selectOne(tableName, self.escape(object)).then(
                    function (result) {
                        newObject = result;
                        callback();
                    }, function (error) {
                        callback(error);
                    }
                );
            }
        ], function (error){
            if(error){
                mainCallback(undefined, error);
            } else {
                mainCallback(newObject, undefined);
            }
        });
    };

    /*
        Deletes the object in the database that matches the query.
     */
    self.delete = function (object, callback) {
        self.sqlWrap.delete(tableName, object).then(
            function (result){
                callback(result, null);
            },
            function (error){
                callback(null, error);
            }
        );
    };
    return self;
};

module.exports = simpleModel;