/**
 * Created by eharoldreyes on 1/26/16.
 */
var mUsers				= require(__dirname + '/../models/users');
var utils				= require(__dirname + '/../helper/utils');
var mysql				= require('mysql');

exports.getMerchants = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false)
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    var query = "WHERE user.role = 'merchant' ";
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
            result.merchants = [];
            result.users.forEach(function (user) {
                delete user.password;
                result.merchants.push(user);
            });
            delete result.users;
            res.status(200).send(result).end();
        }
    });
};

exports.getMerchant = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false)
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    var query = mysql.format("WHERE user.role = 'merchant' AND user.id = ? AND user.status != 'deleted' ", req.params.id);
    mUsers.findOne(query, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete result.password;
            res.status(200).send({error:false, message: "Success", merchant: result}).end();
        }
    });
};

exports.updateMerchant = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || (session.user.id + "" !== req.params.id))
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    var newUser = req.body;
    newUser.date_modified = new Date();
    delete newUser.id;
    delete newUser.email;
    delete newUser.password;
    mUsers.update({id: req.params.id, status:"verified", role:"merchant"}, newUser, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete result.password;
            res.status(200).send({error:false, message: "Success", merchant: result}).end();
        }
    });
};

exports.deleteMerchant = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || session.user.role !== "admin")
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    mUsers.update({id: req.params.id, role:"merchant"}, {date_modified:new Date(), status:"deleted"}, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            res.status(200).send({error:false, message: "Success"}).end();
        }
    });
};


