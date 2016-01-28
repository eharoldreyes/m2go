var	config = {
	development: {
		env: "development",
		port: 10001,
		main: {
			host: "beemo-dev.c3yqncdqz09s.ap-southeast-1.rds.amazonaws.com",
			port: 4000,
			database: "merchants2go",
			user: "beemo",
			password: "b33m0b33m0"
		},
		aws:{
			access_key_id:"AKIAJAUVFB4QQJLB3O4A",
			secret_access_key:"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",
			s3:{
				region:"ap-southeast-1",
				bucket:"merchants2go",
				acl:"public-read"
			},
			sns:{
				topic:"arn:aws:sns:us-east-1:918170112672:thevillagemarket",
				android_arn:'arn:aws:sns:us-east-1:918170112672:app/GCM/thevillagemarket-android',
				ios_arn:'arn:aws:sns:us-east-1:918170112672:app/APNS_SANDBOX/thevillagemarket-ios-dev'
			}
		}
	}
};

!process.env["NODE_ENV"] && (process.env["NODE_ENV"] = "development");
config = config[process.env["NODE_ENV"]];

module.exports = config;
