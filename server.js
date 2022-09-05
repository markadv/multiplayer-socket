const helper = require("./helper.js");
const express = require("express");
const app = express();
const port = 1337;
const server = app.listen(process.env.PORT || port);
app.use(express.static(__dirname + "/public"));
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
        socket.emit("playerInitial", users);
        socket.emit("coinsUpdate", coins);
        socket.emit("leaderboardUpdate", leaderboard);
        users[socket.id] = data;
        io.emit("playerAdd", users[socket.id]);
        io.emit("playerUpdate", users);
    });
    socket.on("disconnect", function () {
        //remove player from client and database
        delete users[socket.id];
        socket.broadcast.emit("removePlayer", socket.id);
        socket.broadcast.emit("playerUpdate", users);
    });
    /* Player actions */
    socket.on("playerMove", function (data) {
        users[data.id] = data;
        io.emit("playerUpdate", users);
    });
    socket.on("profileUpdate", function (data) {
        users[data.id][data.profile] = data.value;
        io.emit("playerUpdate", users);
    });
    socket.on("coinsAdd", function (data) {
        if (users[data.id]["coins"] >= 15) {
            leaderboard[users[data.id].name]
                ? leaderboard[users[data.id].name]++
                : (leaderboard[users[data.id].name] = 1);
            for (let key in users) {
                users[key].coins = 0;
            }
            io.emit("playerWin");
            io.emit("leaderboardUpdate", leaderboard);
        } else {
            users[data.id]["coins"]++;
        }
    });
    /* Coins */
    socket.on("coinsGrab", function (data) {
        delete coins[data];
        coinSpawner();
        io.emit("coinsUpdate", coins);
    });
});
function coinSpawner() {
    while (Object.keys(coins).length < 6) {
        let newCoin = helper.getRandomSafeSpot(),
            cid = helper.getKeyString(newCoin.x, newCoin.y);
        coins[cid] = newCoin;
    }
}
coinSpawner();
