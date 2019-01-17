const Eris = require('eris')
const fs = require('fs')
const path = require('path')
const { embed } = require('./config.json')

class Client {
  constructor (...args) {
    this.bot = new Eris(...args)
  }

  launch () {
    this.bot.commands = new Map()
    this.bot.embed = embed

    this.loadCommands(path.join(__dirname, 'Commands'))
    this.loadEvents(path.join(__dirname, 'Events'))

    this.bot.connect()
  }

  loadCommands (dir) {
    fs.readdir(dir, (error, commands) => {
      if (error) throw error
      for (let i = 0; i < commands.length; i++) {
        const Command = require(path.join(__dirname, 'Commands', commands[i]))
        const command = new Command(this.bot)
        this.bot.commands.set(command.command, command)
      }
    })
  }

  loadEvents (dir) {
    fs.readdir(dir, (error, events) => {
      if (error) throw error
      for (let i = 0; i < events.length; i++) {
        const event = require(path.join(__dirname, 'Events', events[i]))
        event(this.bot)
      }
    })
  }
}

module.exports = Client
