#!/usr/bin/env node

const DiscordBot = require('./discord.bot').DiscordBot;

let discordBot = new DiscordBot();
discordBot.start();