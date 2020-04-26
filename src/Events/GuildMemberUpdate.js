const { vip, defaultServer } = require('../config.js');
const { Logger } = require('../util.js');

const fs = require('fs').promises;
const path = require('path');

module.exports = (bot) => {
  bot.on('guildMemberUpdate', (guild, member, oldMember) => {
    if (guild.id === defaultServer) {
      if (member.roles.length === oldMember.roles.length) return;
      const addedRole = member.roles.length > oldMember.roles.length;
  
      const changedRoleIds = addedRole ? member.roles.filter((role) => {
        return !oldMember.roles.includes(role);
      }) : oldMember.roles.filter((role) => {
        return !member.roles.includes(role);
      });

      const changedRole = guild.roles.get(changedRoleIds[0]);

      switch (changedRole.name) {
      case 'Muted': {
        const mutedFileLoc = path.join(__dirname, '../Data/Muted.json');
        fs.readFile(mutedFileLoc, { encoding: 'utf8' }).then((data) => {
          try {
            data = JSON.parse(data);
          } catch (error) {
            throw Error('Unable to parse JSON object');
          }
  
          if (addedRole) {
            const mutedMember = {
              username: member.user.username,
              startDate: new Date(Date.now())
            };
  
            if (!data[guild.id]) {
              data[guild.id] = {
                guildName: guild.name
              };
            }
            data[guild.id][member.user.id] = mutedMember;
          } else {
            delete data[guild.id][member.user.id];
          }
  
          return fs.writeFile(mutedFileLoc, JSON.stringify(data, 0, 2));
        }).catch((error) => {
          Logger.warn('Unable to update muted list', error);
        });
        break;
      }
      case 'Patreon Superhero':
      case 'Patreon VIP':
      case 'Twitch Subscriber':
      case 'Honorary Sloth':
        if (addedRole) {
          guild.addMemberRole(member.user.id, vip[guild.id].roleID);
        } else {
          const guildRewardRoles = vip[guild.id].rewardRoles;
          const stillDeserving = member.roles.some((roleID) => {
            return guild.roles.find((guildRole) => {
              if (roleID === guildRole.id) {
                if (!guildRewardRoles) {
                  Logger.warn(`${guild.name} has no reward roles for ${member.user.username}`);
                  return false;
                } else {
                  return guildRewardRoles.includes(guildRole.name);
                }
              }
            });
          });
          if (!stillDeserving) guild.removeMemberRole(member.user.id, vip[guild.id].roleID);
        }
        break;
      default:
      }
    }
  });
};
