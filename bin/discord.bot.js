/**
 * Created by Nathan on 6/13/2017.
 */

const Database = require("./database").Database;
const discord = require('discord.js');
const client = new discord.Client();

const CoinMarketCap = require("./site_apis/coinmarketcap").CoinMarketCap;
const Bittrex = require("./site_apis/bittrex").Bittrex;

const config = require("./config.json");

const botIDMessageSuffix = " | bot ID: " + config.bot_id;
let displayBotID = false;

let userDatabase;
let whiteListMap = new Map();

// coin index information
let tickerLookupMap = new Map();
let coinIndexMap = new Map();

module.exports.DiscordBot = class DiscordBot {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "public" methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    constructor() {
        this.coinMarketCapAPI = new CoinMarketCap();
        this.bittrexAPI = new Bittrex();

        userDatabase = new Database("users.db");

        for (let listItem of config.channel_whitelist) {
            whiteListMap.set(listItem, listItem);
        }
    }


    start() {
        client.on("ready", () => {
            // update local cache
            this._updateLocalCache();
            // also setup a timer to continually update it
            setInterval(this._updateLocalCache, config.local_cache_update_interval);

            console.log("Discord bot up and running. Bot ID: " + config.bot_id);
        });
        client.on("message", message => {
            try {
                this._handleMessage(message);
            } catch(e) {
                console.log(e);
            }
        });
        client.on("disconnect", () => {
            // restart in the event of a disconnect after waiting a bit to limit spam
            setTimeout(() => {
                this.start();
            }, 30000);

        });
        client.login(config.api_key);
    }

    stop() {
        client.destroy();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "private" methods that should only be called internally
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    _updateLocalCache() {
        this._updateCoinIndex();
        this.bittrexAPI.updateCache()
    }

    _updateCoinIndex() {
        let callback = function(indexMap, tickerMap) {
            if (indexMap !== undefined) {
                coinIndexMap = indexMap;
                console.log("Initialized index map");
            }
            if (tickerMap !== undefined) {
                tickerLookupMap = tickerMap;
                console.log("Initialized ticket lookup table");
            }
        };
        this.coinMarketCapAPI.fetchCoinIndex(callback);
    }

    _handleMessage(message) {
        // if the message is from a channel that is not in the white list then ignore it
        if (whiteListMap.get(message.channel.id) === undefined) {
            return;
        }

        if (message.content.startsWith("price of ")) {
            let coinName = message.content.substr(9, message.content.length).toLowerCase();

            // if we don't have this token cached, check the ticker lookup table for a symbol
            let symbol = coinName.toUpperCase();
            if (!coinIndexMap.has(coinName) && tickerLookupMap.has(symbol)) {
                coinName = tickerLookupMap.get(symbol);
            }

            const self = this;
            let callback = function(coinPrice) {
                if (coinPrice !== null) {
                    self._respondPublicly(message, "The price of " + coinName + " is " + coinPrice + " USD.");
                } else {
                    self._respondPublicly(message, "Could not find coin: '" + coinName + "'");
                }
            };
            this.coinMarketCapAPI.lookupCoinPrice(coinName, callback);
        }
        else if (message.content.startsWith("watch todo")) {
            this._respondPrivately(message, "Watching coin for you");
            // todo: further implement this
        }
        else if (message.content === "test") {
            //console.log(message);
            let callback = function() {};
            this.bittrexAPI.getMarkets(callback);
        }
        else if (message.content.toLowerCase().startsWith("display id")) {
            if (message.content.toLowerCase().indexOf("true") > -1) {
                displayBotID = true;
            } else {
                displayBotID = false;
            }

            this._respondPublicly(message, "parameter set")
        }
        else if (message.content.toLowerCase().startsWith("bittrex price ")) {
            let currency = message.content.substr("bittrex price ".length, message.content.length).toLowerCase();

            const self = this;
            let callback = function(response) {
                response = self._prettifyJSON(response);

                if (response !== undefined && response !== "") {
                    self._respondPublicly(message, "Result: ```" + response + "```");
                } else {
                    self._respondPublicly(message, "Could not find coin: '" + currency + "'");
                }
            };
            this.bittrexAPI.getTicker(callback, currency);
        }
    }

    _prettifyJSON(jsonText) {
        jsonText = jsonText.replace(/,/g, ",\n").replace(/{/g, "{\n").replace(/}/g, "\n}");
        jsonText = jsonText.substr(2, jsonText.length-4);
        return jsonText;
    }

    _respondPublicly(message, response) {
        if (displayBotID) {
            response = response + botIDMessageSuffix;
        }

        message.reply(response);
    }

    _respondPrivately(message, response) {
        if (displayBotID) {
            response = response + botIDMessageSuffix;
        }

        message.author.sendMessage(response);
    }
}




