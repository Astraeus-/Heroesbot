import { vip, defaultServer } from '../config';
import { Logger } from '../util';

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
