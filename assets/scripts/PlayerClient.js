class Player {
    constructor(playerId, name, direction, sprite, x, y, coins) {
        this.id = playerId;
        this.name = name;
        this.direction = direction === "" ? "right" : direction;
        this.sprite = sprite === "" ? Math.floor(Math.random() * 40) : sprite;
        this.x = x;
        this.y = y;
        this.coins = coins === "" ? 0 : coins;
        this.el = this.playerSpawn();
        this.status = "";
    }
    playerSpawn() {
        const characterEl = document.createElement("div");
        characterEl.classList.add("Character", "grid-cell");
        if (this.id === playerId) {
            characterEl.classList.add("you");
        }
        characterEl.innerHTML = `
            <div class="Character_shadow grid-cell"></div>
            <div class="Character_sprite grid-cell"></div>
            <div class="Character_chat-container">
                <span class="Character_chat"></span>
            </div>
            <div class="Character_name-container">
              <span class="Character_name"></span>
              <span class="Character_coins">0</span>
            </div>
            <div class="Character_you-arrow"></div>
          `;

        //Fill in some initial state
        characterEl.querySelector(".Character_name").innerText = this.name;
        characterEl.querySelector(".Character_coins").innerText = this.coins;
        characterEl.querySelector(".Character_chat").innerText = "";
        characterEl.setAttribute("data-color", this.sprite);
        characterEl.setAttribute("data-direction", this.direction);
        const left = 16 * this.x + "px";
        const top = 16 * this.y - 4 + "px";
        characterEl.style.transform = `translate3d(${left}, ${top}, 0)`;
        gameContainer.appendChild(characterEl);
        return characterEl;
    }
    playerUpdate(fromServer) {
        //Update the DOM here
        this.el.querySelector(".Character_name").innerText = fromServer.name;
        this.el.querySelector(".Character_coins").innerText = fromServer.coins;
        this.el.querySelector(".Character_chat").innerText = fromServer.status;
        this.el.setAttribute("data-color", fromServer.sprite);
        this.el.setAttribute("data-direction", fromServer.direction);
        const left = 16 * fromServer.x + "px";
        const top = 16 * fromServer.y - 4 + "px";
        this.el.style.transform = `translate3d(${left}, ${top}, 0)`;
        // }
    }
}
