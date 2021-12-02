import { vip, defaultServer } from '../config';
import { Logger } from '../util';

import { promises as fs } from 'fs';
import path from 'path';
import HeroesbotClient from '../Client';

export default (client: HeroesbotClient) => {
  client.on('guildMemberUpdate', (guild, member, oldMember) => {
    if (guild.id === defaultServer) {
      if (!oldMember) {
        Logger.warn(`Missing old member data for ${member.username} to check VIP status`);
        return;
      }

      if (member.roles.length === oldMember.roles.length) return;
      const addedRole = member.roles.length > oldMember.roles.length;
  
      const changedRoleIds = addedRole ? member.roles.filter((role) => {
        return !oldMember?.roles.includes(role);
      }) : oldMember.roles.filter((role) => {
        return !member.roles.includes(role);
      });

      const changedRole = guild.roles.get(changedRoleIds[0]);

      if (!changedRole) {
        return;
      }

      switch (changedRole.name) {
      case 'Muted': {
        const mutedFileLoc = path.join(__dirname, '../Data/Muted.json');
        fs.readFile(mutedFileLoc, { encoding: 'utf8' }).then((data) => {
          let mutes;

          try {
            mutes = JSON.parse(data);
          } catch (error) {
            throw Error('Unable to parse JSON object');
          }
  
          if (addedRole) {
            const mutedMember = {
              username: member.user.username,
              startDate: new Date(Date.now())
            };
  
            if (!mutes[guild.id]) {
              mutes[guild.id] = {
                guildName: guild.name
              };
            }
            mutes[guild.id][member.user.id] = mutedMember;
          } else {
            delete mutes[guild.id][member.user.id];
          }
  
          return fs.writeFile(mutedFileLoc, JSON.stringify(mutes, null, 2));
        }).catch((error) => {
          Logger.error('Unable to update muted list', error);
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
            const guildRole = member.guild.roles.get(roleID);
            if (!guildRole) {
              return false;
            }
            
            return guildRewardRoles.includes(guildRole.name);
          });

          if (!stillDeserving) guild.removeMemberRole(member.user.id, vip[guild.id].roleID);
        }
        break;
      default:
      }
    }
  });
};
