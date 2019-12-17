const Eris = require('eris');
const fs = require('fs').promises;
const path = require('path');

class Client {
  constructor (...args) {
    this.bot = new Eris(...args);
  }

  async launch () {
    this.bot.commands = new Map();

    await Client.loadCommands(this.bot, path.join(__dirname, 'Commands'));
    await Client.loadEvents(this.bot, path.join(__dirname, 'Events'));
    return this.bot.connect();
  }

  static async loadCommands (bot, dir) {
    bot.commands.clear();

    return fs.readdir(dir).then((commands) => {
      for (let i = 0; i < commands.length; i++) {
        const command = Client.loadCommand(bot, commands[i]);
        bot.commands.set(command.command, command);
      }
    }).catch((error) => {
      throw error;
    });
  }

  static async loadEvents (bot, dir) {
    bot.removeAllListeners();

    return fs.readdir(dir).then((events) => {
      for (let i = 0; i < events.length; i++) {
        const event = Client.loadEvent(events[i]);
        event(bot);
      }
    }).catch((error) => {
      throw error;
    });
  }

  static loadCommand(bot, commandName) {
    const commandCached = require.cache[require.resolve(path.join(__dirname, 'Commands', commandName))];

    if (commandCached) {
      delete require.cache[require.resolve(path.join(__dirname, 'Commands', commandName))];
    }
      
    const Command = require(path.join(__dirname, 'Commands', commandName));
    return new Command(bot);
  }

  static loadEvent(eventType) {
    const eventCached = require.cache[require.resolve(path.join(__dirname, 'Events', eventType))];

    if (eventCached) {
      delete require.cache[require.resolve(path.join(__dirname, 'Events', eventType))];
    }

    const event = require(path.join(__dirname, 'Events', eventType));
    return event;
  }
}

module.exports = Client;
