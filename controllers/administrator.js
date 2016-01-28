/**
 * Created by eharoldreyes on 1/27/16.
 */
var mUsers				= require(__dirname + '/../models/users');
var utils				= require(__dirname + '/../helper/utils');
var mysql				= require('mysql');

exports.getAdministrators = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || (session.user.role !== "admin" && session.user.role !== "manager"))
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    var query = "WHERE user.role = 'admin' ";
    var page = utils.getQuery(req.query.page) || 1;
    var limit = utils.getQuery(req.query.limit) || 10;
    var status = utils.getQuery(req.query.status) || "all";

    if(status === "verified"){
        query += "AND user.status = 'verified' ";
    } else if (status === "pending") {
        query += "AND user.status = 'pending' ";
    } else if (status === "deleted") {
        query += "AND user.status = 'deleted' ";
    }

    mUsers.findPaginated(query, page, limit, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            result.error = false;
            result.message = "Success";
            result.administrators = [];
            result.users.forEach(function (user) {
                delete user.password;
                result.administrators.push(user);
            });
            delete result.users;
            res.status(200).send(result).end();
        }
    });
};

exports.getAdministrator = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || (session.user.role !== "admin" && session.user.role !== "manager"))
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    var query = mysql.format("WHERE user.role = 'admin' AND user.id = ? AND user.status != 'deleted' ", req.params.id);
    mUsers.findOne(query, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete result.password;
            res.status(200).send({error:false, message: "Success", administrator: result}).end();
        }
    });
};

exports.updateAdministrator = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || session.user.role !== "admin")
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    var newUser = req.body;
    newUser.date_modified = new Date();
    delete newUser.id;
    delete newUser.email;
    delete newUser.password;
    mUsers.update({id: req.params.id, status:"verified", role:"admin"}, newUser, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete result.password;
            res.status(200).send({error:false, message: "Success", administrator: result}).end();
        }
    });
};

exports.deleteAdministrator = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || session.user.role !== "admin")
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    mUsers.update({id: req.params.id, role:"admin"}, {date_modified:new Date(), status:"deleted"}, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            res.status(200).send({error:false, message: "Success"}).end();
        }
    });
};