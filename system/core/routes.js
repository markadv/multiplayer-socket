/* Gemu MVC routes by Markad */
const express = require("express");
const fs = require("fs");
const path = require("path");
/* Load developer assigned routes in config by Markad*/
const { routes } = require("./config");

/* This snippet assigns the class to Controller.className */
let controllers = {};
const controllersDir = path.join(__dirname, "..", "..", "controllers");
fs.readdirSync(controllersDir).forEach(function (file) {
    let varName = file.split(".")[0];
    let controllerClass = require("../../controllers/" + file);
    controllers[varName] = new controllerClass();
});
const router = express.Router();
/* This creates route based className and methodName similar to
Code Igniter by Markad*/
for (let controller in controllers) {
    for (let method in controllers[controller]) {
        if (typeof controllers[controller][method] !== "function") {
            /* Guard clause to prevent non-function variables here*/
            console.log("Not a function");
        } else if (method[0] === "_") {
            console.log("Not a route function");
        } else if (routes[`/${controller}/${method}`]) {
            console.log("reroute", routes[`/${controller}/${method}`]);
            /* Uses router stack to determine if it is get or post by Markad*/
            router.get(routes[`/${controller}/${method}`], controllers[controller][method]);
            router.post(routes[`/${controller}/${method}`], controllers[controller][method]);
        } else {
            console.log("standard");
            router.get(`/${controller}/${method}`, controllers[controller][method]);
            router.post(`/${controller}/${method}`, controllers[controller][method]);
        }
    }
}

module.exports = router;
