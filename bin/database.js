/**
 * Created by Nathan on 6/13/2017.
 */

const loki = require("lokijs");

let dbName;
let databaseConnection;
let tableMap = new Map();

module.exports.Database = class Database {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "public" methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    constructor(databaseName) {
        dbName = databaseName;
        databaseConnection = new loki(databaseName);
        databaseConnection.on("loaded", () => {
            console.log("Database loaded");
        });

        // put together the list of already existing collections for this database
        let collectionNameList = databaseConnection.listCollections();
        for (let collectionName of collectionNameList) {
            let collection = databaseConnection.getCollection(collectionName);
            tableMap.set(collectionName, collection);
        }
    }

    createTable(tableName) {
        let newTable = databaseConnection.addCollection(tableName);
        tableMap.set(tableName, newTable);
    }

    insertData(tableName, jsonData) {
        let table = tableMap.get(tableName);
        if (table !== undefined) {
            table.insert(jsonData);
        } else {
            this._tableNotFoundLogError(tableName);
        }
    }

    find(tableName, jsonData) {
        let table = tableMap.get(tableName);
        if (table !== undefined) {
            table.find(jsonData);
        } else {
            this._tableNotFoundLogError(tableName);
        }
    }

    findOne(tableName, jsonData) {
        let table = tableMap.get(tableName);
        if (table !== undefined) {
            table.findOne(jsonData);
        } else {
            this._tableNotFoundLogError(tableName);
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "private" methods that should only be called internally
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    _tableNotFoundLogError(tableName) {
        console.log("Attempted to use table " + tableName + " from database " + dbName + " but was not able to find it");
    }
}