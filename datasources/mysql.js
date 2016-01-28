var config = require(__dirname + "/../config/config").main;
module.exports = require("mysql").createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    connectionLimit: 10
});