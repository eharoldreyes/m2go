/**
 * Created by eharoldreyes on 1/26/16.
 */
var crypto = require("crypto");
var algorithm = 'aes-256-ctr';
exports.decrypt = function(text, secret) {
    var decipher = crypto.createDecipher(algorithm,secret);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
};

exports.encrypt = function(text, secret) {
    var cipher = crypto.createCipher(algorithm,secret);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};