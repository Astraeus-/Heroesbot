
const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

const { defaultServer } = require('../config.js');

class Sub extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['sub_recruitment_eu', 'sub_recruitment_na'],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'sub',
      'category': 'roleassignment',
      'aliases': ['substitute', 'subplayer'],
      'min_args': 1,
      'description': 'Add or remove yourself from a sub player group',
      'syntax': 'sub <Group>\nGroup options are: Rare, Legendary, Epic and Mythic.'
    };
    
    super(permissions, options, bot);
  }

  exec (msg, args) {
    const guild = msg.channel.guild || this.bot.guilds.get(defaultServer);
    const member = guild.members.get(msg.author.id);
    const subName = args[0].toLowerCase();
    let role;

    switch(subName) {
    case 'rare':
      role = guild.roles.find((role) => {
        return role.name === 'Sub Rare';
      });
      break;
    case 'legendary':
      role = guild.roles.find((role) => {
        return role.name === 'Sub Legendary';
      });
      break;
    case 'epic':
      role = guild.roles.find((role) => {
        return role.name === 'Sub Epic';
      });
      break;
    case 'mythic':
      role = guild.roles.find((role) => {
        return role.name === 'Sub Mythic';
      });
      break;
    default:
      role = false;
      break;
    }

    if (!role) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Sub group: ${subName} does not exist`);
      });
    }

    if (member) {
      return updateMember(member, role).then((notificationMessage) => {
        return msg.author.getDMChannel().then((channel) => {
          return channel.createMessage(notificationMessage);
        }).catch((error) => {
          Logger.warn(`Could not notify ${member.username} about ${role.name} role status`, error);
        });
      });
    } else {
      return msg.author.getDMChannel().then((channel) => {
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
      return `Welcome to the ${member.guild.name} ${role.name} player group.`;
    });
  } else {
    return member.removeRole(role.id).then(() => {
      return `You have left the ${member.guild.name} ${role.name} player group.`;
    });
  }
};

module.exports = Sub;
