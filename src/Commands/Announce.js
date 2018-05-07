const BaseCommand = require('../Classes/BaseCommand.js')

class Announce extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops', 'bot_commands'],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'announce',
      aliases: ['a'],
      description: 'Makes an announcement in the specified channel.',
      syntax: 'announce [#channel] [message]',
      min_args: 2,
      invokeDM: false
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    if (args.length < this.min_args) return this.bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage('Invalid number of arguments'))

    const announcementMessage = args.slice(1, args.length).join(' ')
    const channelMention = msg.channelMentions[0] || null
    const announcementChannel = msg.channel.guild.channels.get(channelMention)

    if (announcementChannel && announcementMessage) {
      if (msg.attachments.length === 0) {
        announcementChannel.createMessage(announcementMessage)
      } else {
        const attachment = {
          'image': {
            'url': msg.attachments[0].url
          }
        }

        announcementChannel.createMessage({
          content: announcementMessage,
          embed: attachment
        })
      }
    } else {
      this.bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`))
    }
  }
}

module.exports = Announce
