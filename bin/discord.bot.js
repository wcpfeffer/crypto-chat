/**
 * Created by Nathan on 6/13/2017.
 */

const discord = require('discord.js');
const client = new discord.Client();

var config = require("./config.json");
var CoinTask = require("./tasks").CoinTask;

module.exports.DiscordBot = class DiscordBot {
    start() {
        client.on('ready', () => {
            console.log('Discord bot up and running');
        });

        client.on('message', message => {
            if (message.content === 'ping') {
                message.reply('pong');
            }
            else if(message.content.startsWith("price of ")){
                let coinName = message.content.substr(9, message.content.length);

                let callback = function(coinPrice) {
                    if(coinPrice !== null) {
                        message.reply("the price of " + coinName + " is " + coinPrice + " USD.");
                    } else {
                        message.reply("could not find coin");
                    }
                };

                let coinTask = new CoinTask(callback);
                coinTask.lookupCoinPrice(coinName);
            }
        });

        client.login(config.api_key);
    }

    stop() {
        client.destroy();
    }
}




