var crypto 	= require('crypto');
var fs 		= require('fs');

exports.checkRequiredFields = function (json, keys) {
	var missing = [];
	keys.forEach(function (key){
		if(!json.hasOwnProperty(key)){
			missing.push(key);
		}
	});
	return missing;
};

exports.toTitleCase = function (str) {
	if (str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
	return false;
};

exports.currentDate = function () {
	var d = new Date();
	return [d.getFullYear(), this.pad(d.getMonth() + 1), this.pad(d.getDate())].join('-');
};

exports.toDay = function (str) {
	return   str.replace("Mon", "M")
	.replace(/Tue(s?)/g, "T")
	.replace("Wed", "W")
	.replace(/Thurs|Th/g, "H")
	.replace("Fri", "F")
	.replace("Sat", "S");
};

exports.hash = function (string, hash) {
	var salt = hash || 'sha1';
	var iterations = 5000;
	var keylen = 64;
	return new Buffer(crypto.pbkdf2Sync(string, salt, iterations, keylen), 'binary').toString('base64');
};

exports.toBase64 = function (string){
	return new Buffer(string).toString('base64');
};

exports.random_string = function (l) {
	var text = "";
	var length = parseInt(l) || 5;
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};

exports.dateToUTC = function(){
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

exports.randomHash = function() {
	var seed = crypto.randomBytes(20);
	return crypto.createHash('sha1').update(seed).digest('hex');
};

exports.rmDir = function(dirPath) {
	try { var files = fs.readdirSync(dirPath); }
	catch(e) { return; }
	if (files.length > 0)
		for (var i = 0; i < files.length; i++) {
			var filePath = dirPath + '/' + files[i];
			if (fs.statSync(filePath).isFile())
				fs.unlinkSync(filePath);
			else
				rmDir(filePath);
		}
		fs.rmdirSync(dirPath);
};

exports.rm_file = function (newPath) {
	try {
		fs.unlinkSync(newPath);
		fs.unlinkSync(newPath +'.cache');
		fs.unlinkSync(newPath +'.mpc');
	} catch(e) {}
};

exports.getQuery = function (query) {
	if(query && Array.isArray(query)){
		return query[0];
	} else {
		return query;
	}
};