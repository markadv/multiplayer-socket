class World {
    constructor() {
        this.players = {};
    }
    /* Spawns all players currently connected */
    playerInitial(playerList) {
        for (let id in playerList) {
            console.log(playerId);
            if (id !== playerId) {
                this.players[id] = new Player(
                    id,
                    playerList[id].name,
                    playerList[id].direction,
                    playerList[id].color,
                    playerList[id].x,
                    playerList[id].y,
                    playerList[id].coins
                );
                this.addPlayer(this.players[id]);
                console.log(this.players);
            }
        }
    }
    addPlayer(player) {
        this.players[player.id] = player;
    }
    removePlayer(id) {
        gameContainer.removeChild(this.players[id].el);
        delete this.players[id];
    }
    getAll() {
        return this.players;
    }
}
