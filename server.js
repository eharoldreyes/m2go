if (!Number.prototype.trim) {
    Number.prototype.trim = function () {
        return this;
    };
}
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
if(!Array.prototype.contains){
    Array.prototype.contains = function(element){
        return this.indexOf(element) > -1;
    };
}
if(!Date.prototype.toMysqlFormat){
    Date.prototype.toMysqlFormat = function() {
        return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
    };
}
if(!String.prototype.getBytes){
    String.prototype.getBytes = function () {
        var bytes = [];
        for (var i = 0; i < this.length; ++i) {
            bytes.push(this.charCodeAt(i));
        }
        return bytes;
    };
}
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}


var config          = require(__dirname + "/config/config");
var routes   		= require(__dirname + "/config/router");
var logger          = require(__dirname + "/libs/logger");
var cors 			= require(__dirname + "/libs/cors");

var AWS 			= require('aws-sdk');
AWS.config.update({accessKeyId: config.aws.access_key_id, secretAccessKey: config.aws.secret_access_key});

var bodyParser      = require("body-parser");
var morgan 			= require("morgan");
var response_time 	= require("response-time");
var method_override = require("method-override");
var express         = require("express");
var session         = require("express-session");
var app             = express();
var router          = routes(express.Router(), logger);

app.use(cors("*"));
app.use(morgan("dev", {immediate : true}));
app.use(response_time());
app.use(method_override());
app.use(bodyParser.urlencoded({extended: false, defer: true}));
app.use(bodyParser.json());
app.use('/documentation', express.static(__dirname + '/doc'));
app.use(router);
app.set("server_port", config.port);
app.listen(app.get("server_port"));


logger.log("info", "Initializing server. ENV = ", process.env["NODE_ENV"]);
logger.log("info", "Listening Server on port : ", app.get("server_port"));

module.exports = app;