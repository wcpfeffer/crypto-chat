/**
 * Created by Nathan on 6/13/2017.
 */

const discord = require('discord.js');
const client = new discord.Client();

var config = require("./config.json");
var CoinTask = require("./tasks").CoinTask;

var whiteListMap = new Map();

module.exports.DiscordBot = class DiscordBot {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "public" methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    constructor() {
        for (let listItem of config.channel_whitelist) {
            console.log(listItem);
            whiteListMap.set(listItem, listItem);
        }
    }

    start() {
        client.on('ready', () => {
            console.log('Discord bot up and running');
        });
        client.on('message', message => {
            this._handleMessage(message);
        });
        client.login(config.api_key);
    }

    stop() {
        client.destroy();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "private" methods that should only be called internally
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    _handleMessage(message) {
        // if the message is from a channel that is not in the white list then ignore it
        if (whiteListMap.get(message.channel.id) === undefined) {
            return;
        }

        if (message.content === 'ping') {
            message.reply('pong');
        }
        else if (message.content.startsWith("price of ")){
            let coinName = message.content.substr(9, message.content.length);

            let callback = function(coinPrice) {
                if (coinPrice !== null) {
                    message.reply("the price of " + coinName + " is " + coinPrice + " USD.");
                } else {
                    message.reply("could not find coin");
                }
            };

            let coinTask = new CoinTask(callback);
            coinTask.lookupCoinPrice(coinName);
        }
        else if (message.content === "test") {
            console.log(message);
            console.log(" - - - - - ");
            console.log(message.channel.id);
        }
    }
}




