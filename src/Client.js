const Eris = require('eris');
const fs = require('fs').promises;
const path = require('path');
const { embed } = require('./config.js');

class Client {
  constructor (...args) {
    this.bot = new Eris(...args);
  }

  launch () {
    this.bot.commands = new Map();
    this.bot.embed = embed;

    this.loadCommands(path.join(__dirname, 'Commands'));
    this.loadEvents(path.join(__dirname, 'Events'));

    return this.bot.connect();
  }

  loadCommands (dir) {
    fs.readdir(dir).then((commands) => {
      for (let i = 0; i < commands.length; i++) {
        const Command = require(path.join(__dirname, 'Commands', commands[i]));
        const command = new Command(this.bot);
        this.bot.commands.set(command.command, command);
      }
    }).catch((error) => {
      throw error;
    });
  }

  loadEvents (dir) {
    fs.readdir(dir).then((events) => {
      for (let i = 0; i < events.length; i++) {
        const event = require(path.join(__dirname, 'Events', events[i]));
        event(this.bot);
      }
    }).catch((error) => {
      throw error;
    });
  }
}

module.exports = Client;
