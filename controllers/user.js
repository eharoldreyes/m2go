/**
 * Created by eharoldreyes on 1/21/16.
 */
var mUsers				= require(__dirname + '/../models/users');
var utils				= require(__dirname + '/../helper/utils');
var validator			= require(__dirname + '/../helper/validator');
var mSessions			= require(__dirname + '/../models/sessions');
var mysql				= require('mysql');
var async				= require('async');

exports.register = function (req, res) {
    var session = req.session;
    var newUser = req.body;
    if(!validator.isEmail(newUser.email))
        return res.status(400).send({ error: true, message: "Invalid email."});
    if(!validator.isMissing(newUser.password) && newUser.password.length >= 6) {
        newUser.password = utils.hash(newUser.password);
    } else {
        return res.status(400).send({ error: true, message: "Invalid password."});
    }
    if(req.params.role === "admin") {
        newUser.role = "admin";
    } else if (req.params.role === "merchant") {
        newUser.role = "merchant";
        newUser.status = "pending";
    } else if (req.params.role === "manager") {
        if(!session || session.authorized === false || session.user.role !== "admin")
            return res.status(403).send({error:true, message:"Forbidden"}).end();
        newUser.role = "manager";
    } else if (req.params.role === "rider") {
        if(!session || session.authorized === false || (session.user.role !== "admin" && session.user.role !== "manager"))
            return res.status(403).send({error:true, message:"Forbidden"}).end();
        newUser.referrer_id = session.user.id;
        newUser.role = "rider";
    } else {
        return res.status(404).send({error: true, message : "Page not found."});
    }
    mUsers.save(newUser, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            res.status(200).send({error:false, message: "Success", user: result}).end();
        }
    });
};

exports.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    var loggedUser = {};

    if (validator.isMissing(email))
        return res.status(400).send({ error: true, message: "Missing email."});
    if(!validator.isEmail(email))
        res.status(400).send({error:true, message: "Invalid email"}).end();
    if (validator.isMissing(password))
        return res.status(400).send({ error: true, message: "Missing password."});

    async.series([
        function (callback) {
            var query = mysql.format("WHERE user.email = ? AND user.password = ?", [email, utils.hash(password)]);
            mUsers.findOne(query, function (result, error) {
                if(error){
                    callback(error);
                } else {
                    loggedUser = result;
                    callback();
                }
            });
        }, function (callback) {
            var session = {
                user_id: loggedUser.id,
                access_token: utils.random_string(50),
                ip_address: ipAddress
            };
            mSessions.save(session, function (result, error) {
                if(error){
                    callback(error);
                } else {
                    loggedUser.access_token = result.access_token;
                    callback();
                }
            });
        }
    ], function (error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete loggedUser.password;
            delete loggedUser.role;
            res.status(200).send({error:false, message: "Success", user: loggedUser}).end();
        }
    });
};

exports.logout = function (req, res) {
    var session = req.session;
    if(session.authorized === false)
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    mSessions.delete({user_id:session.user.id, access_token:session.user.access_token}, function (result, error) {
        if(error) {
            return res.status(error.statusCode || 500).send({ error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            return res.status(200).send({ error:false, message: "Success"}).end();
        }
    });
};

exports.forgotPassword = function (req, res, next) {

};

exports.changePassword = function (req, res, next) {

};

exports.verify = function (req, res, next) {

};
