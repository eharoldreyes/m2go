exports.isMissing = function(str) {
	return (!str || str.trim().length === 0);
};

exports.isEmail = function(str) {
	return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str);
};

exports.isImage = function(file){
	return /^image\/(jpe?g|png|gif)$/i.test(file.mimetype);
	//return file !== undefined && (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg');
};

exports.isVideo = function(file) {
	return file !== undefined && (file.mimetype === 'video/x-flv' || file.mimetype === 'video/mp4' || file.mimetype === 'application/x-mpegURL' ||
		file.mimetype === 'video/MP2T'  || file.mimetype === 'video/3gpp' || file.mimetype === 'video/quicktime' ||
		file.mimetype === 'video/x-msvideo' || file.mimetype === 'video/x-ms-wmv');
};

exports.isAudio = function (file) {
	return /^audio\/(aac|mp4|mpeg|ogg|wav|webm|mp3)$/i.test(file.mimetype);
};