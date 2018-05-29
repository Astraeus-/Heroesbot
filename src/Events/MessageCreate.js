const Handler = require('../Classes/CommandHandler.js')
const Logger = require('../util/Logger.js')
const config = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(config.webhooks.id, config.webhooks.token)

module.exports = (bot) => {
  const CommandHandler = new Handler(bot)
  bot.on('messageCreate', (msg) => {
    if (!bot.ready || !msg.author || msg.author.bot) return // Ignore webhooks and bot users.
    let commands = msg.content.match(/(?:!|#)(\S+)/gim) // regular expression to get anything starting with ! or # and any following characters except the white space.
    let args

    if (commands) {
      let command
      for (let i = 0; i < commands.length; i++) {
        let curr = CommandHandler.findCommand(commands[i].slice(1))
        if (curr) {
          command = curr
          args = CommandHandler.listArguments(commands[i], msg)
          break // Only try to execute the first command we find.
        }
      }

      if (command) {
        if (!command.enabled) return bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage(`Command ${command.prefix + command.command} is disabled`))
        if (!msg.channel.guild && !command.invokeDM) return msg.channel.createMessage(`The command ${command.prefix + command.command} is disabled for use in DM's`)

        const cooldown = CommandHandler.checkCooldown(command, msg.channel.id)
        if (cooldown) {
          if (command.prefix === '!') {
            return bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage(`The command ${command.prefix + command.command} is on cooldown for ${cooldown}ms`))
          }
          return // Exit silently if #command is on cooldown.
        }

        const hasPermissions = msg.channel.guild ? CommandHandler.checkPermissions(command, msg) : true
        if (!hasPermissions) {
          if (command.prefix === '!') {
            return bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage(`You do not have permission to use ${command.prefix + command.command}`))
          } else {
            return // Exit silently if user does not have permission to use #commands.
          }
        }

        try {
          // Do not send webhook notifications for messages in Test-Server.
          if (!msg.channel.guild || msg.channel.guild.id !== '321640682840391680') {
            webhook.send({
              title: 'A command was used',
              color: bot.embed.color,
              description: `Command: ${command.prefix + command.command} \nGuild: ${msg.channel.guild ? msg.channel.guild.name : 'N/A'} \nUser: ${msg.author.username}#${msg.author.discriminator}`
            })
          }
          command.exec(msg, args)
          CommandHandler.addCooldown(command, msg.channel.id, command.cooldown)
        } catch (error) {
          Logger.error(`Error executing ${command.command}`, error)
        }
      }
    }
  })
}
