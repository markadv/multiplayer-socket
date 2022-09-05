class Player {
    constructor(playerId, name, x, y) {
        this.id = playerId;
        this.name = name;
        this.direction = "right";
        this.color = helper.randomFromArray(playerColors);
        this.x = x;
        this.y = y;
        this.coins = 0;
    }
    static playerInitial(data) {
        for (let key in data) {
            const characterEl = document.createElement("div");
            characterEl.classList.add("Character", "grid-cell");
            characterEl.innerHTML = `
            <div class="Character_shadow grid-cell"></div>
            <div class="Character_sprite grid-cell"></div>
            <div class="Character_name-container">
              <span class="Character_name"></span>
              <span class="Character_coins">0</span>
            </div>
            <div class="Character_you-arrow"></div>
          `;
            playerElements[data[key].id] = characterEl;

            //Fill in some initial state
            characterEl.querySelector(".Character_name").innerText = data[key].name;
            characterEl.querySelector(".Character_coins").innerText = data[key].coins;
            characterEl.setAttribute("data-color", data[key].color);
            characterEl.setAttribute("data-direction", data[key].direction);
            const left = 16 * data[key].x + "px";
            const top = 16 * data[key].y - 4 + "px";
            characterEl.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameContainer.appendChild(characterEl);
        }
    }
    static playerAdd(data) {
        const addedPlayer = data;
        const characterEl = document.createElement("div");
        characterEl.classList.add("Character", "grid-cell");
        if (addedPlayer.id === playerId) {
            characterEl.classList.add("you");
        }
        characterEl.innerHTML = `
            <div class="Character_shadow grid-cell"></div>
            <div class="Character_sprite grid-cell"></div>
            <div class="Character_name-container">
              <span class="Character_name"></span>
              <span class="Character_coins">0</span>
            </div>
            <div class="Character_you-arrow"></div>
          `;
        playerElements[addedPlayer.id] = characterEl;

        //Fill in some initial state
        characterEl.querySelector(".Character_name").innerText = addedPlayer.name;
        characterEl.querySelector(".Character_coins").innerText = addedPlayer.coins;
        characterEl.setAttribute("data-color", addedPlayer.color);
        characterEl.setAttribute("data-direction", addedPlayer.direction);
        const left = 16 * addedPlayer.x + "px";
        const top = 16 * addedPlayer.y - 4 + "px";
        characterEl.style.transform = `translate3d(${left}, ${top}, 0)`;
        gameContainer.appendChild(characterEl);
    }
    playerUpdate(data) {
        players = data || {};
        for (let key in playerElements) {
            if (players[key] === undefined) {
                gameContainer.removeChild(playerElements[key]);
                delete playerElements[key];
            }
        }
        for (let key in players) {
            const characterState = players[key];
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
    }
}
