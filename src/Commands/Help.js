const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

class Help extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'help',
      description: 'Lists all of Heroesbot\'s commands.',
      syntax: 'help [command]'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      title: '',
      fields: []
    }

    let helpCommand

    if (args.length > 0) {
      if (args[0].startsWith('!')) {
        let command = args[0].toLowerCase().slice(1)
        let commands = Array.from(this.bot.commands.values())
        helpCommand = commands.find((c) => c.command === command || c.aliases.includes(command))
      }
    }

    if (helpCommand) {
      let aliases = helpCommand.aliases.join(', ')
      if (aliases.length === 0) aliases = 'No command aliases'
      embed.title = `📖 ${helpCommand.prefix + helpCommand.command} help 📖`
      embed.fields.push({
        'name': 'Aliases',
        'value': aliases
      }, {
        'name': 'Description',
        'value': helpCommand.description
      }, {
        'name': 'Syntax',
        'value': helpCommand.prefix + helpCommand.syntax
      }, {
        'name': 'Cooldown',
        'value': `${helpCommand.cooldown}ms`
      }, {
        'name': 'DM Invokable',
        'value': helpCommand.invokeDM
      })
    } else {
      embed.title = '📖 Heroesbot command list 📖'
      this.bot.commands.forEach((command) => {
        if (command.ignoreInHelp) return
        if (!command.enabled) return
        embed.fields.push({
          'name': command.prefix + command.command,
          'value': command.description
        })
      })
    }

    this.bot.getDMChannel(msg.author.id).then((channel) => {
      channel.createMessage({
        embed: embed
      }).catch((error) => {
        Logger.error('!help embed has grown too large', error)
        throw error
      })
    })
  }
}

module.exports = Help
