var dev = require(getUserHome() + "/node_config.json");
var	config = {
	development: {
		env: "development",
		port: 10001,
		main: dev.merchants2go.main,
		aws: dev.merchants2go.aws
	}
};

!process.env["NODE_ENV"] && (process.env["NODE_ENV"] = "development");
config = config[process.env["NODE_ENV"]];

function getUserHome() {
	return process.env.HOME || process.env.USERPROFILE;
}

module.exports = config;
