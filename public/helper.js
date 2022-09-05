class helper {
    static mapData = {
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
    static randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static getKeyString(x, y) {
        return `${x}x${y}`;
    }

    static createName() {
        const prefix = helper.randomFromArray([
            "ASTIGING",
            "MAGARANG",
            "SIKAT NA",
            "MAYABANG NA",
            "SWABENG",
            "POGING",
            "GWAPONG",
            "MAGANDANG",
            "SEKSING",
            "MACHONG",
            "MAYAMAN NA",
            "MAHABANG",
            "MAITIM NA",
            "MALAMBOT NA",
            "ADIK NA",
            "MATALINONG",
            "PANGIT NA",
            "SANTONG",
        ]);
        const hayop = helper.randomFromArray([
            "OSO",
            "ASO",
            "PUSA",
            "SUROT",
            "TUPA",
            "LEON",
            "BABOY",
            "KAMBING",
            "DAGA",
            "SAGING",
            "MANOK",
            "KABAYO",
            "KALABAW",
            "BAKA",
            "IPIS",
        ]);
        return `${prefix} ${hayop}`;
    }

    static isSolid(x, y) {
        const blockedNextSpace = helper.mapData.blockedSpaces[helper.getKeyString(x, y)];
        return (
            blockedNextSpace ||
            x >= helper.mapData.maxX ||
            x < helper.mapData.minX ||
            y >= helper.mapData.maxY ||
            y < helper.mapData.minY
        );
    }

    static getRandomSafeSpot() {
        //We don't look things up by key here, so just return an x/y
        return helper.randomFromArray([
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 1, y: 5 },
            { x: 2, y: 6 },
            { x: 2, y: 8 },
            { x: 2, y: 9 },
            { x: 4, y: 8 },
            { x: 5, y: 5 },
            { x: 5, y: 8 },
            { x: 5, y: 10 },
            { x: 5, y: 11 },
            { x: 11, y: 7 },
            { x: 12, y: 7 },
            { x: 13, y: 7 },
            { x: 13, y: 6 },
            { x: 13, y: 8 },
            { x: 7, y: 6 },
            { x: 7, y: 7 },
            { x: 7, y: 8 },
            { x: 8, y: 8 },
            { x: 10, y: 8 },
            { x: 8, y: 8 },
            { x: 11, y: 4 },
        ]);
    }
}
