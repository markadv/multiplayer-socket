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
    move = (xMove, yMove, coins) => {
        const newX = this.x + xMove;
        const newY = this.y + yMove;
        let gotCoin = false;
        if (!helper.isSolid(newX, newY)) {
            this.x = this.x + xMove;
            this.y = this.y + yMove;
            this.changeDirection(xMove);
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
        } else if (xChange === -1) {
            this.direction = "left";
        }
    };
};
