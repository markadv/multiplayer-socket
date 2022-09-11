// read-all.js
const fs = require("fs");
const yaml = require("js-yaml");

try {
    let fileContents = fs.readFileSync("./config.yaml", "utf8");
    let data = yaml.load(fileContents);

    module.exports = data;
} catch (e) {
    console.log(e);
}

//Orginal implementation in case I don't want YAML
// module.exports = {
//     enableProfiler: true,
//     localPort: 8888,
//     /* Developer defined routes */
//     routes: {
//         "/Users/index": "/",
//         "/Users/process_registration": "/process/register",
//         "/Users/process_login": "/process/login",
//         "/Users/success": "/success",
//         "/Users/logoff": "/logoff",
//     },
//     dbdriver: "pg",
//     /* Database credentials template PG */
//     database1: { host: "localhost", port: 5432, user: "postgres", password: "123456", database: "postgres", max: 30 },
//     /* Database credentials template MYSQL */
//     database2: {
//         host: "localhost",
//         port: 3308,
//         user: "root",
//         password: "",
//         database: "gemu_mvc",
//         waitForConnections: true,
//         connectionLimit: 10,
//         queueLimit: 0,
//     },
//     /* Session information */
//     sessionConfig: { secret: "gemu_mvc", resave: false, saveUninitialized: true, cookie: { maxAge: 60000 } },
// };
