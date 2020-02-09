
const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

const { defaultServer } = require('../config.js');

class Fa extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['lfg'],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'freeagent',
      'category': 'roleassignment',
      'aliases': ['fa'],
      'description': 'Add or remove yourself from the free agent role group',
      'enabled': false
    };
    
    super(permissions, options, bot);
  }

  exec (msg) {
    const guild = msg.channel.guild || this.bot.guilds.get(defaultServer);
    const member = guild.members.get(msg.author.id);
    const role = guild.roles.find((role) => {
      return role.name === 'FreeAgent';
    });

    if (member) {
      return updateMember(member, role).then((notificationMessage) => {
        msg.author.getDMChannel().then((channel) => {
          return channel.createMessage(notificationMessage);
        }).catch((error) => {
          Logger.warn(`Could not notify ${member.username} about ${role.name} status`, error);
        });
      });
    } else {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`You are not part of ${guild.name} so can not assign ${role.name}`);
      }).catch((error) => {
        Logger.warn(`Could not notify ${msg.author.username} about not belonging to ${guild.name}`, error);
      });
    }
  }
}

const updateMember = async (member, role) => {
  if (!member.roles.includes(role.id)) {
    return member.addRole(role.id).then(() => {
      return `Welcome to the ${member.guild.name} Free Agent group.`;
    });
  } else {
    return member.removeRole(role.id).then(() => {
      return `You have left the ${member.guild.name} Free-agent group.`;
    });
  }
};

module.exports = Fa;
