/**
 * Created by eharoldreyes on 1/21/16.
 */
var mSessions   = require(__dirname + "/../models/sessions");
var mApps       = require(__dirname + "/../models/applications");
var aes         = require(__dirname + "/../helper/crypt_aes");
var mysql       = require("mysql");
var moment      = require('moment');

var secret      = "yyhlmrbkCvnFAFQi";
var expiration  = 86400000;

exports.generateToken = function (req, res) {
    var basic = req.headers["authorization"];
    if(typeof basic === "string" && basic.length > 6) {
        var tmp = basic.split(' ');
        var buf = new Buffer(tmp[1], 'base64');
        var basicString = buf.toString();
        var credentials = basicString.split(':');
        var apiKey = credentials[0].trim();
        var apiSecret = credentials[1].trim();
        var query = mysql.format("WHERE application.api_key = ? AND application.api_secret = ? ", [apiKey, apiSecret]);

        var s = aes.encrypt("Merchants2Go" + "/1/" + basicString + "/" + new Date().toISOString(), secret);
        console.log("token", s);
        //ee0940f3fced8b47529b19fc1e8e3911a53d855f92e5b1078549abb670bcaa83e4e11f283c84579439a7aa0f14e7b328aa9206c8ca8e153519155a77fe9cde9943f17e06

        mApps.findOne(query, function (result, error) {
            if(error){
                if(error.statusCode === 404){
                    res.status(401).send({error:true, message: "Unauthorized"}).end();
                } else {
                    res.status(error.statusCode || 500).send({error:true, message: error.message || "Failed", error_log:error}).end();
                }
            } else {
                var token = aes.encrypt("Merchants2Go" + "/" + result.id + "/" + basicString + "/" + new Date().toISOString(), secret);
                res.status(200).send({error:false, message: "Success", access_token:token, app_key: apiKey, token_type:"Bearer", expires_in: expiration}).end();
            }
        });
    } else {
        res.status(401).send({error:true, message: "Unauthorized"}).end();
    }
};

exports.checkAuthorization = function (req, res, next){
    var bearer = req.headers["authorization"];
    if(typeof bearer === "string" && bearer.length > 6) {
        try {
            var decrypted = aes.decrypt(bearer.split(' ')[1].trim(), secret).split('/');
            var merchant = {
                id: decrypted[1],
                api_key: decrypted[2].split(":")[0],
                api_secret: decrypted[2].split(":")[1],
                created:decrypted[3]
            };
            var created = moment(merchant.created).toDate().getTime();
            var now = new Date().getTime();
            var diff = now - created;
            if(diff < expiration){
                req.bearer = merchant;
                next();
            } else {
                res.status(401).send({error:true, message: "Token expired."}).end();
            }
        } catch (error){
            res.status(401).send({error:true, message: "Invalid token."}).end();
        }
    } else {
        res.status(401).send({error:true, message: "Unauthorized."}).end();
    }
};

exports.authorize = function (req, res, next) {
    var accessToken = req.get("Access-Token");
    req.session = {authorized: false};
    if (accessToken != undefined) {
        exports.authenticate(accessToken, function (user, error) {
            if (error) {
                req.session.authorized = false;
                req.session.user = undefined;
            } else {
                req.session.authorized = true;
                req.session.user = user;
            }
            next();
        });
    } else {
        next();
    }
};

exports.authenticate = function (access_token, mainCallback) {
    mSessions.selectOne("WHERE session.access_token = " + mysql.escape(access_token), function (result, error) {
        if (error) {
            if (error.statusCode === 404)
                mainCallback(undefined, {statusCode: 403, message: "Unauthorized"});
            else
                mainCallback(undefined, error);
        } else {
            mainCallback(result, undefined);
        }
    });
};