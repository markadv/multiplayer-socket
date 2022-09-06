// var socket = io({ upgrade: false, transports: ["websocket", "polling"] });
var socket = io();
socket.emit("initServer");
let world = new World();

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];
let playerId;
let coins = {};
let coinElements = {};
let audioBgm;
let moveAllowed = true;
let changeNameAllowed = true;
let changeColorAllowed = true;
let changeChatAllowed = true;
let initialDom = false;

const gameContainer = document.querySelector(".game-container");
const playerNameInput = document.querySelector("#player-name");
const playerChatInput = document.querySelector("#player-chat");
const playerColorButton = document.querySelector("#player-color");
const audio = document.querySelector("audio");

async function attemptGrabCoin(x, y) {
    const key = helper.getKeyString(x, y);
    if (coins[key]) {
        // Remove this key from data, then uptick player's coin count
        const playerList = world.getAll();
        playerList[playerId].coins++;
        var audioCoin = new Audio("/sfx/collect-coin.mp3");
        audioCoin.play();
        socket.emit("coinsAdd", { key: key });
    }
}

async function handleControls(xChange = 0, yChange = 0) {
    if (!moveAllowed) {
        return;
    }
    moveAllowed = false;
    //Testing server based timer
    // setTimeout(() => (moveAllowed = true), 100);
    playMusic();
    /* Controls */
    const playerList = world.getAll();
    const newX = playerList[playerId].x + xChange;
    const newY = playerList[playerId].y + yChange;
    if (!helper.isSolid(newX, newY)) {
        //move to the next space
        playerList[playerId].x = newX;
        playerList[playerId].y = newY;
        if (xChange === 1) {
            playerList[playerId].direction = "right";
        }
        if (xChange === -1) {
            playerList[playerId].direction = "left";
        }
        await attemptGrabCoin(newX, newY);
        await socket.emit("playerMove", playerList[playerId]);
    }
}

function playMusic() {
    /* Music */
    if (!audioBgm) {
        audioBgm = new Audio();
        let i = 0,
            playlist = ["/bgm/Run-Amok.mp3", "/bgm/Fluffing-a-Duck.mp3", "/bgm/Fast-Feel-Banana-Peel.mp3"];

        audioBgm.addEventListener(
            "ended",
            function () {
                i = ++i < playlist.length ? i : 0;
                audioBgm.src = playlist[i];
                audioBgm.play();
            },
            true
        );
        audioBgm.volume = 0.1;
        audioBgm.loop = false;
        audioBgm.src = playlist[0];
        audioBgm.play();
    }
}

function initGame() {
    new Controller("ArrowUp", () => handleControls(0, -1));
    new Controller("KeyW", () => handleControls(0, -1));
    new Controller("ArrowDown", () => handleControls(0, 1));
    new Controller("KeyS", () => handleControls(0, 1));
    new Controller("ArrowLeft", () => handleControls(-1, 0));
    new Controller("KeyA", () => handleControls(-1, 0));
    new Controller("ArrowRight", () => handleControls(1, 0));
    new Controller("KeyD", () => handleControls(1, 0));

    playerNameInput.addEventListener("change", (e) => {
        if (changeNameAllowed) {
            changeNameAllowed = false;
            const playerList = world.getAll();
            let newName = e.target.value || helper.createName();
            newName = newName.toUpperCase();
            console.log(newName);
            playerNameInput.value = newName;
            playerList[playerId].name = newName;
            socket.emit("profileUpdate", { profile: "name", value: newName });
        }
    });

    playerColorButton.addEventListener("click", () => {
        if (changeColorAllowed) {
            changeColorAllowed = false;
            const playerList = world.getAll();
            const mySkinIndex = playerColors.indexOf(playerList[playerId].color);
            const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
            playerList[playerId].color = nextColor;
            socket.emit("profileUpdate", { profile: "color", value: nextColor });
        }
    });

    playerChatInput.addEventListener("change", (e) => {
        if (changeChatAllowed) {
            moveAllowed = false;
            console.log(moveAllowed);
            changeChatAllowed = false;
            const playerList = world.getAll();
            let newChat = e.target.value;
            newChat = newChat.toUpperCase();
            // playerChatInput.value = newChat;
            playerList[playerId].chat = newChat;
            socket.emit("profileUpdate", { profile: "chat", value: newChat });
        }
    });
    /* User spawn */
    socket.on("playerInitial", function (users) {
        world.playerInitial(users);
        initialDom = true;
        console.log(world);
    });
    /* Player sockets */
    socket.on("playerUpdate", function (fromServer) {
        if (!initialDom) return;
        changeNameAllowed = true;
        changeChatAllowed = true;
        changeColorAllowed = true;
        moveAllowed = true;
        for (let id in fromServer) {
            let playerList = world.getAll();
            playerList[id].playerUpdate(fromServer[id]);
        }
    });
    /* When another user spawn */
    socket.on("playerSpawn", function (user) {
        let newPlayer = new Player(user.id, user.name, user.direction, user.color, user.x, user.y, user.coins);
        world.addPlayer(newPlayer);
    });
    /* Remove player that disconnects from the DOM */
    socket.on("removePlayer", function (id) {
        world.removePlayer(id);
    });
    /* End of player sockets */
    socket.on("coinsUpdate", function (data) {
        coins = data;
        /* Remove excess coins */
        for (let key in coinElements) {
            if (data[key] === undefined) {
                gameContainer.removeChild(coinElements[key]);
                delete coinElements[key];
            }
        }
        for (let key in data) {
            if (!coinElements[key]) {
                let x = data[key].x,
                    y = data[key].y;
                keyString = helper.getKeyString(x, y);
                coins[keyString] = true;

                //Create DOM element
                const coinEl = document.createElement("div");
                coinEl.classList.add("Coin", "grid-cell");
                coinEl.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="Coin_sprite grid-cell"></div>
        `;
                // Position the Element
                const left = 16 * x + "px";
                const top = 16 * y - 4 + "px";
                coinEl.style.transform = `translate3d(${left}, ${top}, 0)`;

                // Keep a reference for removal later and add to DOM
                coinElements[keyString] = coinEl;
                gameContainer.appendChild(coinEl);
            }
        }
    });
}

socket.on("playerWin", function () {
    const playerList = world.getAll();
    for (let key in playerList) {
        playerList[key].coins = 0;
    }
    var audioCoin = new Audio("/sfx/win.mp3");
    audioCoin.play();
});
socket.on("leaderboardUpdate", function (leaderboard) {
    /* Leaderboard */
    if (Object.keys(leaderboard).length > 0) {
        $(".leaderboard-list").html("");
        let sortList = [];
        for (let leader in leaderboard) {
            sortList.push([leader, leaderboard[leader]]);
        }
        sortList.sort(function (a, b) {
            return b[1] - a[1];
        });
        for (let i = 0; i < sortList.length; i++) {
            $(".leaderboard-list").append(`<li>${sortList[i][0] + " : " + sortList[i][1]}</li>`);
        }
    }
});

socket.on("userConnect", function (id) {
    playerId = id;
    const name = helper.createName();
    playerNameInput.value = name;
    const { x, y } = helper.getRandomSafeSpot();
    let user = new Player(id, name, "", "", x, y, "");
    world.addPlayer(user);
    socket.emit("userSpawn", user);
    initGame();
});
