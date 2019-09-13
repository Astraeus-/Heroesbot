const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class EditMessage extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        users: []
      }
    };

    const options = {
      prefix: '!',
      command: 'editmessage',
      aliases: ['edit'],
      description: 'Replace the specified messsage with the updated message.',
      syntax: 'edit <#channel> <message ID> <new message>',
      min_args: 3,
      invokeDM: false
    };

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg, args) {
    const updateMessage = args.slice(2, args.length).join(' ');
    const updateMessageId = args[1];
    const channelMention = msg.channelMentions[0] || null;
    const editMessageChannel = msg.channel.guild.channels.get(channelMention);

    if (editMessageChannel) {
      const update = {
        content: updateMessage
      };

      if (msg.attachments.length > 0) {
        const attachment = {
          image: {
            url: msg.attachments[0].url
          }
        };
        update.embed = attachment;
      } else {
        update.embed = null;
      }

      return editMessageChannel.getMessage(updateMessageId).then((message) => {
        if (message.author.id !== this.bot.user.id) {
          return msg.author.getDMChannel().then((channel) => {
            return channel.createMessage('The message specified does not belong to Heroesbot');
          }).catch((error) => {
            Logger.warn('Could not notify invalid editMessage message specified', error);
          });
        } else {
          return message.edit(update);
        }
      });
    } else {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`);
      }).catch((error) => {
        Logger.warn('Could not notify invalid editMessage syntax', error);
      });
    }
  }
}

module.exports = EditMessage;
