module.exports = class World {
    constructor() {
        this.players = {};
        this.mapData = {
            minX: 1,
            maxX: 14,
            minY: 4,
            maxY: 12,
            blockedSpaces: {
                "7x4": true,
                "1x11": true,
                "12x10": true,
                "4x7": true,
                "5x7": true,
                "6x7": true,
                "8x6": true,
                "9x6": true,
                "10x6": true,
                "7x9": true,
                "8x9": true,
                "9x9": true,
            },
        };
    }
    addPlayer(player) {
        this.players[player.id] = player;
    }
    removePlayer(id) {
        delete this.players[id];
    }
    getAll() {
        return this.players;
    }
};
