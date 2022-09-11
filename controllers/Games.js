const Controller = require("../system/core/Controller");
const Game = require("../models/Game");

module.exports = class Games extends Controller {
    /* For model, you have to declare this as private to prevent
    it from showing in routes. Replace with protected class
    as soon as available */
    #Game;
    constructor() {
        super();
        this.#Game = new Game();
    }
    index = async (req, res) => {
        await this._view(req, res, { title: "Games", content: "Games/index", data: {} });
    };
};
