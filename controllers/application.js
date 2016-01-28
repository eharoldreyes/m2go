/**
 * Created by eharoldreyes on 1/21/16.
 */
var mApps				= require(__dirname + '/../models/applications');
var mVaults				= require(__dirname + '/../models/vaults');
var utils				= require(__dirname + '/../helper/utils');
var mysql				= require('mysql');
var async				= require('async');
var url                 = require('url');


exports.createApplication = function (req, res) {
    var session = req.session;
    var newApplication = req.body;
    if(!session || session.authorized === false)
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    async.series([
        function (callback) {
            var query = mysql.format("WHERE vault.user_id = ? ", session.user.id);
            mVaults.find(query, function (result, error) {
                if(error){
                    if(error.statusCode === 404){
                        callback({statusCode:403, message:"No banking details available."});
                    } else {
                        callback(error);
                    }
                } else if (result.length > 0) {
                    callback();
                } else {
                    callback({statusCode:403, message:"No banking details available."});
                }
            });
        }, function (callback) {
            newApplication.user_id = session.user.id;
            newApplication.api_key = "2GO-" + utils.random_string(12);
            newApplication.api_secret = utils.random_string(32);

            if(newApplication.domain && utils.isURL(newApplication.domain))
                newApplication.domain = url.parse(newApplication.domain).hostname;

            newApplication.status = "inactive";

            mApps.save(newApplication, function (result, error) {
                if(error){
                    callback(error);
                } else {
                    newApplication = result;
                    callback();
                }
            });
        }
    ], function (error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            delete result.password;
            res.status(200).send({error:false, message: "Success", application: newApplication}).end();
        }
    });
};

exports.retrieveApplications = function (req, res) {
    var session = req.session;
    var page = utils.getQuery(req.query.page) || 1;
    var limit = utils.getQuery(req.query.limit) || 10;
    var query = "";
    if(!session || session.authorized === false || (session.user.role !== "admin" && session !== "merchant"))
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    if(session.user.role === "merchant")
        query = mysql.format("WHERE application.user_id = ? ", session.user.id);

    mApps.find(query, page, limit, function (result, error){
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            result.error = false;
            result.message = "Success";
            res.status(200).send(result).end();
        }
    });
};

exports.retrieveApplication = function (req, res) {
    var session = req.session;
    var query = mysql.format("WHERE application.id = ? ", req.params.id);
    if(!session || session.authorized === false || (session.user.role !== "admin" && session !== "merchant"))
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    if(session.user.role === "merchant")
        query += mysql.format("AND application.user_id = ? ", session.user.id);

    mApps.findOne(query, function (result, error){
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            result.error = false;
            result.message = "Success";
            res.status(200).send(result).end();
        }
    });
};

exports.updateApplication = function (req, res, next) {
    var session = req.session;
    var newApplication = req.body;
    if(!session || session.authorized === false || (session.user.role !== "admin" && session !== "merchant") || session.user.role === "merchant" && (session.user.id + "" === req.params.id))
        return res.status(403).send({error:true, message:"Forbidden"}).end();
    if(newApplication.email && !utils.isEmail(newApplication.email))
        return res.status(400).send({error:true, message:"Invalid email"}).end();
    if(session.user.role !== "admin"){
        delete newApplication.status;
    }
    delete newApplication.id;
    delete newApplication.user_id;
    delete newApplication.api_key;
    delete newApplication.api_secret;
    delete newApplication.namespace;

    newApplication.date_modified = new Date();

    mApps.update({id:req.params.id}, newApplication, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            res.status(200).send({error:false, message: "Success", application: result}).end();
        }
    });
};

exports.deleteApplication = function (req, res) {
    var session = req.session;
    if(!session || session.authorized === false || (session.user.role !== "admin" && session !== "merchant") || session.user.role === "merchant" && (session.user.id + "" === req.params.id))
        return res.status(403).send({error:true, message:"Forbidden"}).end();

    mApps.update({id: req.params.id}, {date_modified:new Date(), status:"terminated"}, function (result, error) {
        if(error){
            res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
        } else {
            res.status(200).send({error:false, message: "Success"}).end();
        }
    });
};