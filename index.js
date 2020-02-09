import 'babel-polyfill';
require('dotenv').config();
const discord = require('./config/discord');

const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

client.login(process.env.DC_KEY);

discord(client);

const disconnect = () => {
  console.log('Exit');
  // if (this.connection) this.connection.disconnect();
  process.exit();
};
process.on('exit', disconnect);
process.on('SIGINT', disconnect);
