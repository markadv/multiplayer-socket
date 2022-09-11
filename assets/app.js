var socket = io({
    "force new connection": true,
    reconnection: true,
    reconnectionDelay: 2000, //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
    reconnectionDelayMax: 60000, //1 minute maximum delay between connections
    reconnectionAttempts: "Infinity", //to prevent dead clients, having the user to having to manually reconnect after a server restart.
    timeout: 10000, //before connect_error and connect_timeout are emitted
    upgrade: false,
    transports: ["websocket", "polling"],
});
socket.emit("initServer");
let world = new World();

let playerId;
let coins = {};
let coinElements = {};
let audioBgm;
let moveAllowed = true;
let changeNameAllowed = true;
let changeSpriteAllowed = true;
let changeChatAllowed = true;
let initialDom = false;
let inChat = false;
let inName = false;

const gameContainer = document.querySelector(".game-container");
const playerNameInput = document.querySelector("#player-name");
const playerChatInput = document.querySelector("#player-chat");
const playerColorButton = document.querySelector("#player-color");
const audio = document.querySelector("audio");

socket.on("disconnected", function (data) {
    console.log("disconnected");
    $("body").html(`<p>${data.message}</p>`);
});

async function handleControls(movement) {
    if (!moveAllowed) {
        return;
    }
    moveAllowed = false;
    playMusic();
    await socket.emit("playerMove", movement);
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
    new Controller("ArrowUp", () => handleControls("moveUp"));
    new Controller("KeyW", () => handleControls("moveUp"));
    new Controller("ArrowDown", () => handleControls("moveDown"));
    new Controller("KeyS", () => handleControls("moveDown"));
    new Controller("ArrowLeft", () => handleControls("moveLeft"));
    new Controller("KeyA", () => handleControls("moveLeft"));
    new Controller("ArrowRight", () => handleControls("moveRight"));
    new Controller("KeyD", () => handleControls("moveRight"));

    playerNameInput.addEventListener("change", (e) => {
        if (changeNameAllowed) {
            inName = true;
            changeNameAllowed = false;
            moveAllowed = false;
            const playerList = world.getAll();
            let newName = e.target.value || helper.createName();
            newName = newName.toUpperCase();
            playerNameInput.value = newName;
            if (newName === undefined) {
                newName = helper.createName();
            }
            playerList[playerId].name = newName;
            socket.emit("profileUpdate", { profile: "name", value: newName });
        }
    });

    playerColorButton.addEventListener("click", () => {
        if (changeSpriteAllowed) {
            changeSpriteAllowed = false;
            const playerList = world.getAll();
            //change from color to sprite
            const nextSprite = Math.floor(Math.random() * 40);
            playerList[playerId].sprite = nextSprite;
            socket.emit("profileUpdate", { profile: "sprite", value: nextSprite });
        }
    });

    playerChatInput.addEventListener("change", (e) => {
        if (changeChatAllowed) {
            inChat = true;
            moveAllowed = false;
            const playerList = world.getAll();
            let newChat = e.target.value;
            newChat = newChat.toUpperCase();
            // playerChatInput.value = newChat;
            playerList[playerId].status = newChat;
            socket.emit("profileUpdate", { profile: "status", value: newChat });
        }
    });
    /* User spawn */
    socket.on("playerInitial", function (users) {
        world.playerInitial(users);
        initialDom = true;
    });
    /* Player sockets */
    socket.on("playerUpdate", function (fromServer) {
        if (!initialDom) return;
        changeNameAllowed = true;
        changeChatAllowed = true;
        changeSpriteAllowed = true;
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
    socket.on("gotCoin", function () {
        const playerList = world.getAll();
        playerList[playerId].coins++;
        console.log("coins");
        var audioCoin = new Audio("/sfx/collect-coin.mp3");
        console.log("sounds");
        audioCoin.play();
    });
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

socket.on("userConnect", function (user, users) {
    playerId = user.id;
    playerNameInput.value = user.name;
    world.playerInitial(users);
    initialDom = true;
    initGame();
});
