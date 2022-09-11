module.exports = (async () => {
    const express = require("express");
    const app = express();
    const bodyParser = require("body-parser");
    const session = require("express-session");
    const config = require("./config");
    const { routes, sessionConfig, enableProfiler, localPort, enableRedis } = config;
    const { getObjKey } = require("../helper/helper");
    const path = require("path");
    /* Redis */
    if (enableRedis) {
        const redis = require("ioredis");
        const redisClient = redis.createClient();
        redisClient.on("error", (err) => {
            console.log("Redis error: ", err);
        });
        const redisStore = require("connect-redis")(session);
        const redisSession = new redisStore({ host: "localhost", port: 6379, client: redisClient, ttl: 86400 });
        sessionConfig.store = redisSession;
    } else {
        sessionConfig.cookie.secure = true;
        sessionConfig.cookie.maxAge = 60000;
    }
    /* End of redis */

    // support parsing of application/json type post data
    app.use(bodyParser.json());
    //support parsing of application/x-www-form-urlencoded post data
    app.use(bodyParser.urlencoded({ extended: true }));
    const sessionMiddleware = session(sessionConfig);
    app.use(sessionMiddleware);
    // setting up ejs and our views folder
    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, "..", "..", "assets")));

    /* Profiler */
    profiler = (req, res, next) => {
        if (!req.session.profiler) {
            /* Get class method from the new routes */
            const startTime = performance.now();
            const classMethod = getObjKey(routes, req.url);
            /* Get memory used */
            const used = process.memoryUsage().rss / 1024 / 1024;
            const mbUsed = Math.round(used * 100) / 100;
            res.locals.profiler = {
                getparams: req.params,
                getquery: req.query,
                post: req.body,
                memoryUsage: mbUsed,
                httpHeader: req.headers,
                session: req.session,
                route: { classMethod: classMethod, url: req.url },
                config: config,
            };
            const endTime = performance.now();
            let timeExec = Math.round((endTime - startTime) * 1000) / 1000;
            res.locals.profiler["performance"] = timeExec;
        } else {
            res.locals.profiler = JSON.parse(req.session.profiler);
            delete req.session.profiler;
        }

        next();
    };

    if (enableProfiler) {
        app.use(profiler);
    }
    /* End of profiler */

    app.use("/", require("./routes"));
    const port = process.env.PORT || localPort;
    // tell the express app to listen on port
    const server = app.listen(port, function () {
        console.log(`listening on port ${port}`);
    });
    require("./game.js")(server, sessionMiddleware);
})();
