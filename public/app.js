var socket = io();
socket.emit("initServer");

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

let playerId;
let players = {};
let playerElements = {};
let coins = {};
let coinElements = {};
let audioBgm;
let moveAllowed = true;

const gameContainer = document.querySelector(".game-container");
const playerNameInput = document.querySelector("#player-name");
const playerColorButton = document.querySelector("#player-color");
const audio = document.querySelector("audio");

async function attemptGrabCoin(x, y) {
    const key = helper.getKeyString(x, y);
    if (coins[key]) {
        // Remove this key from data, then uptick player's coin count
        players[playerId].coins++;
        var audioCoin = new Audio("/sfx/collect-coin.mp3");
        audioCoin.play();
        socket.emit("coinsAdd", { key: key, id: playerId });
        if (players[playerId].coins >= 15) {
            players[playerId].coins = 0;
        }
    }
}

async function handleControls(xChange = 0, yChange = 0) {
    if (!moveAllowed) {
        return;
    }
    moveAllowed = false;
    setTimeout(() => (moveAllowed = true), 120);
    playMusic();
    /* Controls */
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
    if (!helper.isSolid(newX, newY)) {
        //move to the next space
        players[playerId].x = newX;
        players[playerId].y = newY;
        if (xChange === 1) {
            players[playerId].direction = "right";
        }
        if (xChange === -1) {
            players[playerId].direction = "left";
        }
        await attemptGrabCoin(newX, newY);
        await socket.emit("playerMove", players[playerId]);
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
        const newName = e.target.value || helper.createName();
        playerNameInput.value = newName.toUpperCase();
        socket.emit("profileUpdate", { id: playerId, profile: "name", value: newName });
    });

    playerColorButton.addEventListener("click", () => {
        const mySkinIndex = playerColors.indexOf(players[playerId].color);
        const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
        socket.emit("profileUpdate", { id: playerId, profile: "color", value: nextColor });
    });
    /* Player sockets */
    socket.on("playerUpdate", function (data) {
        players = data || {};
        /* Look for stray bodies of disconnected users */
        for (let key in playerElements) {
            if (players[key] === undefined) {
                gameContainer.removeChild(playerElements[key]);
                delete playerElements[key];
            }
        }
        for (let key in players) {
            const characterState = data[key];
            let el = playerElements[key];
            //Update the DOM here
            el.querySelector(".Character_name").innerText = characterState.name;
            el.querySelector(".Character_coins").innerText = characterState.coins;
            el.setAttribute("data-color", characterState.color);
            el.setAttribute("data-direction", characterState.direction);
            const left = 16 * characterState.x + "px";
            const top = 16 * characterState.y - 4 + "px";
            el.style.transform = `translate3d(${left}, ${top}, 0)`;
        }
    });
    /* User spawn */
    socket.on("playerInitial", function (data) {
        Player.playerInitial(data);
    });
    /* When another user spawn */
    socket.on("playerAdd", function (data) {
        Player.playerAdd(data);
    });
    /* Remove player that disconnects from the DOM */
    socket.on("removePlayer", function (data) {
        gameContainer.removeChild(playerElements[data]);
        delete playerElements[data];
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

socket.on("playerWin", function (leaderboard) {
    for (let key in players) {
        players[key].coins = 0;
        socket.emit("profileUpdate", { id: players[key].id, profile: "coins", value: 0 });
    }

    var audioCoin = new Audio("/sfx/win.mp3");
    audioCoin.play();
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

socket.on("userConnect", function (data) {
    playerId = data;

    const name = helper.createName();
    playerNameInput.value = name;
    const { x, y } = helper.getRandomSafeSpot();
    let user = new Player(playerId, name, x, y);
    socket.emit("userSpawn", user);

    initGame();
});
