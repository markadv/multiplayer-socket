const express = require("express");
const app = express();
const port = 1337;
const server = app.listen(process.env.PORT || port);
app.use(express.static(__dirname + "/public"));
// const io = require("socket.io")(server, { upgrade: false, transports: ["websocket", "polling"] });
const io = require("socket.io")(server);
let users = {},
    coins = { "7x7": { x: 7, y: 7 } },
    leaderboard = {};
//Using player id for DOM
io.on("connection", function (socket) {
    /* Initialize connection */
    socket.on("initServer", function () {
        socket.emit("userConnect", socket.id);
    });
    /* Initialize spawn and disconnect */
    socket.on("userSpawn", function (data) {
        users[socket.id] = data;
        console.log(users);
        socket.emit("playerInitial", users);
        socket.emit("coinsUpdate", coins);
        socket.emit("leaderboardUpdate", leaderboard);
        socket.broadcast.emit("playerSpawn", users[socket.id]);
    });
    socket.on("disconnect", function () {
        //remove player from client and database
        delete users[socket.id];
        socket.broadcast.emit("removePlayer", socket.id);
    });
    /* Player actions (Must be fully optimized)
    Update dependent. */
    socket.on("playerMove", function (data) {
        users[data.id] = data;
    });
    /* Change Name/Color Update dependent. */
    socket.on("profileUpdate", function (data) {
        users[socket.id][data.profile] = data.value;
        // io.emit("playerUpdate", users);
    });
    socket.on("coinsAdd", function (data) {
        users[socket.id]["coins"]++;
        if (users[socket.id]["coins"] >= 15) {
            users[socket.id]["coins"] = 0;
            for (let key in users) {
                users[key].coins = 0;
            }
            leaderboard[users[socket.id].name]
                ? leaderboard[users[socket.id].name]++
                : (leaderboard[users[socket.id].name] = 1);

            io.emit("playerWin");
            io.emit("leaderboardUpdate", leaderboard);
        }
        delete coins[data.key];
        coinSpawner();
        io.emit("coinsUpdate", coins);
    });
});
/* This sends constant update instead of firing based on input */
let playerUpdateLoop = setInterval(() => io.emit("playerUpdate", users), 150);
function coinSpawner() {
    while (Object.keys(coins).length < 4) {
        let newCoin = getRandomSafeSpot(),
            cid = getKeyString(newCoin.x, newCoin.y);
        coins[cid] = newCoin;
    }
}
coinSpawner();
function getKeyString(x, y) {
    return `${x}x${y}`;
}
function getRandomSafeSpot() {
    return randomFromArray([
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 2, y: 8 },
        { x: 2, y: 9 },
        { x: 4, y: 8 },
        { x: 5, y: 5 },
        { x: 5, y: 8 },
        { x: 5, y: 10 },
        { x: 5, y: 11 },
        { x: 11, y: 7 },
        { x: 12, y: 7 },
        { x: 13, y: 7 },
        { x: 13, y: 6 },
        { x: 13, y: 8 },
        { x: 7, y: 6 },
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 8, y: 8 },
        { x: 10, y: 8 },
        { x: 8, y: 8 },
        { x: 11, y: 4 },
    ]);
}
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
