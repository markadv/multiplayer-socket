const QueryBuilder = require("./QueryBuilder.js");
const helper = require("../helper/helper");
const { MongoClient } = require("mongodb");
module.exports = class Model {
    constructor() {
        this.config = require("./config");
        /* Preload all the database lib to prevent bottlenecks by Markad */
        this.mysql = require("mysql2/promise");
        this.pg = require("pg-promise");
        this.mongodb = require("mongodb");
        this.dbdriver;
        this.db = this.config.database1;
        this.db2 = this.config.database2;
        this.db3 = this.config.database3;
        this.connection;
        this.qb = new QueryBuilder();
        this.helper = helper;
        this.bcrypt = require("bcryptjs");
    }
    setDbdriver = async () => {
        if (this.config.dbdriver === "mysql") {
            this.dbdriver = this.mysql;
        } else if (this.config.dbdriver === "pg") {
            const pgp = this.pg();
            this.dbdriver = await pgp(this.db);
        } else if (this.config.dbdriver === "mongodb") {
            const client = await new MongoClient(this.config.database3.uri);
            this.dbdriver = await client;
        }
    };
    /* This creates a pool for mysql, refactor in the future since postgres
    automatically pools and mongodb doesn't use pool */
    createPool = async () => {
        if (this.config.dbdriver === "mysql") {
            return await this.dbdriver.createPool(this.db2);
        } else if (this.config.dbdriver === "pg") {
            return await this.dbdriver;
        } else if (this.config.dbdriver === "mongodb") {
            return await this.dbdriver.connect();
        }
    };
    connectToDatabase = async () => {
        try {
            if (this.connection) {
                return;
            }
            await this.setDbdriver();
            let pool = await this.createPool();
            this.connection = pool;
        } catch (error) {
            return console.log(`Could not connect - ${error}`);
        }
    };
    queryFormat = async (query, values) => {
        if (this.config.dbdriver === "mysql") {
            return await this.dbdriver.format(query, values);
        } else if (this.config.dbdriver === "pg") {
            return await this.pg.as.format(query, values);
        } else if (this.config.dbdriver === "mongodb") {
            return await [query, values];
        }
    };
    profiler = async (res, query) => {
        if (res.locals.profiler !== undefined) {
            res.locals.profiler["query"] === undefined
                ? (res.locals.profiler["query"] = [query])
                : res.locals.profiler["query"].push(query);
        }
    };
    query = async (res, query, values = "") => {
        const queryFormatted = await this.queryFormat(query, values);
        await this.profiler(res, queryFormatted);
        return await this.connection.query(query, values);
    };
    mongoFind = async (res, table, query) => {
        await this.profiler(
            res,
            `this.dbdriver.db(${JSON.stringify(this.db3.database)}).collection(${JSON.stringify(
                table
            )}).find(${JSON.stringify(query)}).toArray()`
        );
        return await this.dbdriver.db(this.db3.database).collection(table).find(query).toArray();
    };
    mongoCreate = async (res, table, query) => {
        await this.profiler(res, JSON.stringify(table, query));
        const result = await this.dbdriver.db(this.db3.database).collection(table).insertOne(query);
        return result.insertedId;
    };
};
