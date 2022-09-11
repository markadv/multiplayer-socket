const helper = require("./helper");

module.exports = class Player {
    constructor(id, socket) {
        const { x, y } = helper.getRandomSafeSpot();
        this.id = id;
        this.name = helper.createName();
        this.x = x;
        this.y = y;
        this.direction = "right";
        this.sprite = helper.randomSprite();
        this.coins = 0;
        this.status = "";
        this.socket;
    }
    changeName = (name) => {
        this.name = name;
    };
    changeSprite = () => {
        this.sprite = Math.floor(Math.random() * 40);
    };
    moveLeft = (coins) => {
        const newX = this.x - 1;
        let gotCoin = false;
        if (!helper.isSolid(newX, this.y)) {
            this.x--;
            this.changeDirection(-1);
            if (helper.attemptGrabCoin(this.x, this.y, coins) === true) {
                this.coins++;
                gotCoin = true;
            }
        }
        return gotCoin;
    };
    moveRight = (coins) => {
        const newX = this.x + 1;
        let gotCoin = false;
        if (!helper.isSolid(newX, this.y)) {
            this.x++;
            this.changeDirection(1);
            if (helper.attemptGrabCoin(this.x, this.y, coins) === true) {
                this.coins++;
                gotCoin = true;
            }
        }
        return gotCoin;
    };
    moveUp = (coins) => {
        const newY = this.y - 1;
        let gotCoin = false;
        if (!helper.isSolid(this.x, newY)) {
            this.y--;
            if (helper.attemptGrabCoin(this.x, this.y, coins) === true) {
                this.coins++;
                gotCoin = true;
            }
        }
        return gotCoin;
    };
    moveDown = (coins) => {
        const newY = this.y + 1;
        let gotCoin = false;
        if (!helper.isSolid(this.x, newY)) {
            this.y++;
            if (helper.attemptGrabCoin(this.x, this.y, coins) === true) {
                this.coins++;
                gotCoin = true;
            }
        }
        return gotCoin;
    };
    getCoin = async () => {
        this.coins++;
    };
    changeStatus = async (status) => {
        this.status = status;
    };
    changeDirection = async (xChange) => {
        if (xChange === 1) {
            this.direction = "right";
        }
        if (xChange === -1) {
            this.direction = "left";
        }
    };
};
