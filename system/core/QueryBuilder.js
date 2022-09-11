module.exports = class QueryBuilder {
    constructor() {
        this._query = "";
        this.whereArray = [];
        this.fromArray = [];
        this.joinArray = [];
        this.selectArray = [];
        this.orderByArray = [];
        this.groupByArray = [];
        this.insertIntoArray = [];
        this.valuesArray = [];
        this.joinArray = [];
        this.selectModifier = "";
    }
    select = (...columns) => {
        if (columns.length === 0) {
            this.selectArray.push("*");
        } else {
            for (let column of columns) {
                if (Array.isArray(column)) {
                    this.selectArray.push(`${column[0]} as "${column[1]}"`);
                } else if (typeof column === "string") {
                    this.selectArray.push(`${column}`);
                } else {
                    console.log("Invalid select input");
                }
            }
        }
        return this;
    };
    /* Input should be conditions in array. Format is [Type of Join, Table, InitialID, TableID] by Markad */
    join = (...conditions) => {
        if (conditions.length === 0) {
            return this;
        }
        for (let condition of conditions) {
            if (Array.isArray(condition)) {
                this.joinArray.push(`${condition[0]} ${condition[1]} ON ${condition[2]}=${condition[3]}`);
            } else {
                console.log("Invalid join input");
            }
        }
        return this;
    };
    selectMod = (mod) => {
        this.selectModifier = mod;
        return this;
    };
    /* Input should be conditions in array. Format is [column, operator, value] by Markad */
    where = (...conditions) => {
        if (conditions.length === 0) {
            return this;
        }
        for (let condition of conditions) {
            if (Array.isArray(condition)) {
                this.whereArray.push(`${condition[0]} ${condition[1]} ${condition[2]}`);
            } else {
                console.log("Invalid where input");
            }
        }
        return this;
    };
    values = (...values) => {
        for (let value of values) {
            this.valuesArray.push(value);
        }
        return this;
    };
    insertInto = (...columns) => {
        for (let column of columns) {
            this.insertIntoArray.push(column);
        }
        return this;
    };
    set = async (table) => {
        this._query = "";
        this._query += `INSERT INTO ${table} `;
        if (this.insertIntoArray.length > 0) {
            this._query += `(${this.insertIntoArray.join(", ")}) `;
        }
        this._query += `VALUES (${this.valuesArray.join(", ")})`;
        let query = this._query;

        this.clear();
        return query;
    };
    get = async (table, values) => {
        this._query = "";
        let select = this.selectModifier.length !== 0 ? `SELECT ${this.selectModifier}` : `SELECT`;
        if (this.selectArray.length !== 0) {
            this._query += `${select} ${this.selectArray.join(", ")} `;
        } else {
            this._query += `${select} * `;
        }
        if (this.fromArray.length !== 0) {
            this._query += `FROM ${this.fromArray.join(", ")}`;
        } else {
            this._query += `FROM ${table}`;
        }
        if (this.joinArray.length !== 0) {
            this._query += ` ${this.joinArray.join(" ")}`;
        }
        if (this.whereArray.length !== 0) {
            this._query += ` WHERE ${this.whereArray.join(" AND ")}`;
        }
        if (this.groupByArray.length !== 0) {
            this._query += ` GROUP BY ${this.groupByArray}`;
        }
        this.clear();

        return this._query;
    };
    clear = () => {
        this.whereArray = [];
        this.fromArray = [];
        this.joinArray = [];
        this.selectArray = [];
        this.orderByArray = [];
        this.groupByArray = [];
        this.insertIntoArray = [];
        this.valuesArray = [];
        this.valuesQArray = [];
        this.joinArray = [];
        this.selectModifier = "";
    };
};
