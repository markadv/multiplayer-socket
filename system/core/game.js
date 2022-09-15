const Player = require("./classes/Player");
const World = require("./classes/World");
const helper = require("./classes/helper");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const rateLimiter = new RateLimiterMemory({
    points: 15, // 15 points
    duration: 1, // per second
});
let world = new World();
let movementMatrix = { moveUp: [0, -1], moveDown: [0, 1], moveRight: [1, 0], moveLeft: [-1, 0] };
/* Start of sockets.io */
module.exports = async (server, sessionMiddleware) => {
    const connectionOptions = {
        transports: ["websocket"], //forces the transport to be only websocket. Server needs to be setup as well/
    };
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    const io = require("socket.io")(server, connectionOptions);
    io.use(wrap(sessionMiddleware));
    let leaderboard = {},
        coins = { "7x7": { x: 7, y: 7 } },
        connectionsLimit = 60;

    io.use((socket, next) => {
        if (socket.request.session.leaderboard !== undefined) {
            leaderboard = socket.request.session.leaderboard;
        } else {
            socket.request.session.leaderboard = {};
        }
        next();
    });

    io.on("connection", function (socket) {
        let allowMove = true;
        /* Initialize connection */
        socket.once("initServer", async function () {
            // const session = socket.request.session;
            if (Object.keys(world.players).length > connectionsLimit) {
                socket.emit("disconnected", { message: "Reach the limit of connections" });
                // socket.disconnect();
                // console.log("Disconnected...");
                return;
            } else if (!world.players[socket.id]) {
                let newPlayer = new Player(socket.id);
                world.addPlayer(newPlayer);
                socket.emit("leaderboardUpdate", leaderboard);
                socket.broadcast.emit("playerSpawn", newPlayer);
                socket.emit("userConnect", newPlayer, world.players);
            }
        });
        socket.on("disconnect", async function () {
            //remove player from client and database
            delete world.removePlayer(socket.id);
            socket.broadcast.emit("removePlayer", socket.id);
            socket.removeAllListeners();
        });
        /* Player actions (Must be fully optimized)
    Update dependent. */
        socket.on("playerMove", async function (movement) {
            try {
                await rateLimiter.consume(socket.handshake.address);
                if (!world.players[socket.id]) {
                    socket.emit("disconnected", { message: "Server restarted. Please refresh your browser." });
                    socket.disconnect();
                    return;
                }
                if (allowMove === false) {
                    return;
                }
                allowMove = false;
                setTimeout(() => (allowMove = true), 100);
                let gotCoin = false;
                //Guard clause to check if input is allowed
                if (typeof movementMatrix[movement] === undefined) {
                    return;
                }
                gotCoin = world.players[socket.id].move(...movementMatrix[movement], coins);
                if (gotCoin === true) {
                    socket.emit("gotCoin");
                    checkWin(socket.id);
                }
            } catch (e) {
                console.log(e);
            }
        });
        /* Change Name/Color Update dependent. */
        socket.on("profileUpdate", function (data) {
            try {
                if (data.profile === "name" || data.profile === "sprite" || data.profile === "status") {
                    world.players[socket.id][data.profile] = data.value;
                }
            } catch (e) {
                console.log(e);
            }
        });
        function checkWin(id) {
            if (typeof world.players[id]["coins"] === undefined) {
                return;
            }
            if (world.players[id]["coins"] >= 10) {
                world.players[id]["coins"] = 0;
                for (let key in world.players) {
                    world.players[key].coins = 0;
                }
                leaderboard[world.players[id].name]
                    ? leaderboard[world.players[id].name]++
                    : (leaderboard[world.players[id].name] = 1);
                socket.request.session.leaderboard = leaderboard;
                io.emit("playerWin", { id: socket.id });
                io.emit("leaderboardUpdate", leaderboard);
            }
            let key = helper.getKeyString(world.players[id].x, world.players[id].y);
            delete coins[key];
            coinSpawner(key);
        }
    });
    /* This sends constant update instead of firing based on input */
    let playerUpdateLoop = setInterval(async () => {
        io.emit("coinsUpdate", coins);
        io.emit("playerUpdate", world.players);
    }, 100);

    function coinSpawner(location) {
        while (Object.keys(coins).length < 4) {
            let newCoin = helper.getRandomSafeSpot(),
                cid = helper.getKeyString(newCoin.x, newCoin.y);
            if (cid !== location) {
                coins[cid] = newCoin;
            }
        }
    }
    coinSpawner();
};
/* End of of sockets.io */
