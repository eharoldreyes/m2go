/**
 * Created by haroldreyes on 8/23/15.
 */
var validator	= require(__dirname + '/../helper/validator');
var multer      = require("multer");
var mkdirp      = require('mkdirp');

var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            var dir = "";
            if (validator.isImage(file)) {
                dir = __dirname + '/../tmp/uploads/images';
            } else if (validator.isVideo(file)) {
                dir = __dirname + '/../tmp/uploads/videos';
            } else if (validator.isAudio(file)) {
                dir = __dirname + '/../tmp/uploads/sounds';
            } else if (file.mimetype === 'application/java-archive' || file.mimetype === 'application/x-java-archive') {
                dir = __dirname + '/../tmp/uploads/builds';
            } else {
                cb(new Error("Invalid file format."));
                return;
            }
            mkdirp(dir, function (err) {
                if(err){
                    cb(err);
                } else {
                    cb(null, dir);
                }
            });
        }, filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + "." + file.originalname.substr(file.originalname.lastIndexOf('.') + 1));
        }
    }
);

module.exports = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if(validator.isImage(file) || validator.isVideo(file) || validator.isAudio(file) || file.mimetype === 'application/java-archive' || file.mimetype === 'application/x-java-archive'){
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});