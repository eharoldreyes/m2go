
var config    		= require(__dirname + '/../config/config').aws;
var s3				= require(__dirname + '/../datasources/s3');
var utils			= require(__dirname + '/utils');
var fileSystem		= require('fs'); 
var async			= require('async'); 

exports.uploadPhoto = function (filePath, type, image, callback){
	var base = "https://s3-" + config.s3.region + ".amazonaws.com/" + config.s3.bucket + "/" + filePath;
	var photoResult = {};
	exports.resizePhoto(image, function (photo, err){
		if(err){
			console.log("resize error", err);
			callback(null, err);
		} else {
			async.parallel([
				function (callback) {
					exports.uploadToS3(filePath, type + "-thumb", photo.thumb.image, function (err, data) {
						utils.rm_file(photo.thumb.path);
						if (err) {
							callback(err);
						} else {
							console.log("Thumbnail photo successfully uploaded.");
							photoResult.thumb = {
								"url" : base + "/" + type + "-thumb.jpg", 
								"data" : data
							};
							callback();
						}
					});
				}, function (callback) {
					exports.uploadToS3(filePath, type + "-large", photo.large.image, function (err, data) {
						utils.rm_file(photo.large.path);
						if (err) {
							callback(err);
						} else {
							console.log("Large photo successfully uploaded.");
							photoResult.large = {
								"url" : base + "/" + type + "-large.jpg", 
								"data" : data
							};
							callback();
						}
					});
				}
			], function (error) {
				if(error) {
					callback(null, error);
				} else {
					callback(photoResult, null);					
				} 
			});
		}
	});
};

exports.uploadMultiplePhotoById = function (id, type, images, callback) {	
	var photosArray = [];
	var tasks		= [];
	images.forEach(function (image) {

		var task = function (callback){
			var path = type + "/" + utils.random_string(2) + "/" + utils.random_string(2); 

			if(id != null) path = type + "/" + id + "/" + utils.random_string(2) + "/" + utils.random_string(2);

			exports.uploadPhoto(path, type, image, 
				function (data, error){
					if(error) {
						callback(error);
					} else {
						photosArray.push(data);
						callback();
					}
				}
			);
		};

		tasks.push(task);
	});	
	async.parallel(tasks, function (error) {
		if(error){
			callback(null, error);
		} else {
			callback(photosArray);
		}
	});
};

exports.uploadMultiplePhoto = function (type, images, callback) {	
	exports.uploadMultiplePhotoById(null, type, images, callback);
};

exports.resizePhoto = function (image, callback){
	var photo = {thumb:{},large:{}};
	async.parallel([
		function (callback) {
			exports.resizeImage(240, image, function (newImage, localPath, err){
				if(err){
					callback(err);
				} else {			
					photo.thumb.path = localPath;
					photo.thumb.image = newImage;
					callback();
				}
			});
		}, function (callback) {
			exports.resizeImage(1024, image, function (newImage, localPath, err){
				if(err){
					callback(err);
				} else {
					photo.large.path = localPath;
					photo.large.image = newImage;
					callback();
				}
			});
		}
	], function (error) {
		if(error){
			callback(null, error);
		} else {
			callback(photo, null);
		}
	});
};

exports.resizeImage = function (size, image, callback){
	var options = {
		width: size,
		height: size,
		srcPath: image.path,
		dstPath: __dirname + "/../tmp/"  + utils.random_string(8) + "." + image.name.substr(image.name.lastIndexOf('.') + 1)
	};
	imagemagick.resize(options, function (err, stdout, stderr) {
		if (err) { 
			callback(null, options.dstPath, err);
		} else {	    	
			fileSystem.readFile(options.dstPath, function (err, newImage) {
				if (err) {
					callback(null, options.dstPath, err);
				} else {
					callback(newImage, options.dstPath, null);
				}
			});
		}
	});
};

exports.uploadToS3 = function (filePath, fileName, file, callback){
	var params = {
		Bucket: config.s3.bucket,
		Key: filePath + "/" + fileName + ".jpg",
		Body: file,
		ACL:config.s3.acl,
		ContentType: 'image/jpeg'  
	};
	s3.putObject(params, callback);
};
