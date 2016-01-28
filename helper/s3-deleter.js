
var config    		= require(__dirname + '/../config/config').aws;
var s3				= require(__dirname + '/../datasources/s3');


exports.deleteFiles = function (paths, callback) {
	var params = {		
		Bucket: config.s3.bucket,
		Delete: {
			Objects: [],
			Quiet: true
		}
	};
	var prefix = "https://s3-" + config.s3.region + ".amazonaws.com/" + config.s3.bucket + "/";
	paths.forEach(function (path){
		var newPath = path.replace(prefix, "");
		params.Delete.Objects.push({Key: newPath});
	});
	console.log("photos.deleteFiles objects", params.Delete.Objects);
	s3.deleteObjects(params, function (err, data) {
		callback(data, err);
	});
};