const BaseCommand = require('../Classes/BaseCommand.js')
const { Logger } = require('../util.js')

const fs = require('fs').promises
const path = require('path')

class Reload extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'reload',
      aliases: [],
      description: 'Hot reloads the commands.',
      syntax: 'reload',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const dir = path.join(__dirname, '../Commands')
    this.bot.commands.clear()

    fs.readdir(dir).then((commands) => {
      for (let i = 0; i < commands.length; i++) {
        delete require.cache[require.resolve(path.join(__dirname, commands[i]))]

        const Command = require(path.join(__dirname, commands[i]))
        const command = new Command(this.bot)
        this.bot.commands.set(command.command, command)
      }

      this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage('Command reloading complete')
      }).catch((error) => {
        Logger.warn('Unable to inform about command reload', error)
      })
    }).catch((error) => {
      Logger.error('Unable to reload commands', error)
    })
  }
}

module.exports = Reload
