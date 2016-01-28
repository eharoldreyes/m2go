var upload					= require(__dirname + '/../libs/multer');
var oauth					= require(__dirname + '/../controllers/authorization');
var users					= require(__dirname + '/../controllers/user');
var admins					= require(__dirname + '/../controllers/administrator');
var managers				= require(__dirname + '/../controllers/manager');
var riders					= require(__dirname + '/../controllers/rider');
var merchants				= require(__dirname + '/../controllers/merchant');
var applications			= require(__dirname + '/../controllers/application');
var deliveries				= require(__dirname + '/../controllers/delivery');
var Qs 						= require('qs');


module.exports = function(router, logger) {
	var decodeBody = function (req, res, next) {
		if(req.get('Content-Type') && req.get('Content-Type').indexOf('multipart/form-data') == 0) {
			Object.keys(req.body).forEach(function (key) {
				req.body[key] = Qs.parse(key + "=" +req.body[key])[key];
			});
		}
		logger.log("verbose", "Multipart-Form", req.body);
		next();
	};
	var logRequest = function (req, res, next) {
		logger.log("verbose", "Agent", req.get("User-Agent"));
		logger.log("verbose", "Address", req.headers["x-forwarded-for"] || req.connection["remoteAddress"]);
		logger.log("verbose", "Method", req.method);
		logger.log("verbose", "Params", req.params);
		logger.log("verbose", "Query", req.query);
		logger.log("verbose", "Body", req.body);
		next();
	};

	router.all(		"*"								, logRequest);
	router.all(		"*"								, oauth.authorize);

	//PRIVATE
	router.post(    "/login"						, users.login);
	router.post(    "/logout"						, users.logout);
	router.post(    "/forgot"						, users.forgotPassword);
	router.put(    	"/password/:token"				, users.changePassword);
	router.post(    "/register/:role"				, upload.single("photo"), decodeBody, users.register);
	router.post(    "/verify/:token"				, users.verify);

	router.get(		"/admins"						, admins.getAdministrators);
	router.get(		"/admin/:id"					, admins.getAdministrator);
	router.put(		"/admin/:id"					, upload.single("photo"), decodeBody, admins.updateAdministrator);
	router.delete(	"/admin/:id"					, admins.deleteAdministrator);

	router.get(		"/managers"						, managers.getManagers);
	router.get(		"/manager/:id"					, managers.getManager);
	router.put(		"/manager/:id"					, upload.single("photo"), decodeBody, managers.updateManager);
	router.delete(	"/manager/:id"					, managers.deleteManager);

	router.get(		"/merchants"					, merchants.getMerchants);
	router.get(		"/merchant/:id"					, merchants.getMerchant);
	router.put(		"/merchant/:id"					, upload.single("photo"), decodeBody, merchants.updateMerchant);
	router.delete(	"/merchant/:id"					, merchants.deleteMerchant);

	router.get(		"/riders"						, riders.getRiders);
	router.get(		"/rider/:id"					, riders.getRider);
	router.put(		"/rider/:id"					, upload.single("photo"), decodeBody, riders.updateRider);
	router.delete(	"/rider/:id"					, riders.deleteRider);

	router.post(	"/application"					, upload.single("app_icon"), decodeBody, applications.createApplication);
	router.get(		"/applications"					, applications.retrieveApplications);
	router.get(		"/application/:id"				, applications.retrieveApplication);
	router.put(		"/application/:id"				, upload.single("app_icon"), decodeBody, applications.updateApplication);
	router.delete(	"/application/:id"				, applications.deleteApplication);

	//PUBLIC
	router.post(    "/oauth2/token"					, oauth.generateToken);
	router.post(    "/calculate"					, oauth.checkAuthorization, deliveries.calculate);
	router.post(    "/deliver"						, oauth.checkAuthorization, deliveries.deliver);

	router.get(		"/deliveries"					, deliveries.retrieveDeliveries);
	router.get(		"/delivery/:id"					, deliveries.retrieveDelivery);
	router.put(		"/delivery/:id"					, deliveries.updateDelivery);
	router.delete(	"/delivery/:id"					, deliveries.deleteDelivery);

	router.all(		"*", function (req, res) {
		res.status(404).send({error: true, message : "Page not found."});
	});
	return router;
};