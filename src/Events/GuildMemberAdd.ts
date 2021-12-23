import { Logger } from '../util';
import { defaultServer } from '../config';
import heroesloungeApi from '../Classes/HeroesLounge';
import HeroesbotClient from '../Client';
import { Sloth } from 'heroeslounge-api';

export default (client: HeroesbotClient) => {
  client.on('guildMemberAdd', (guild, member) => {
    if (guild.id === defaultServer) {
      // Check if the user was already registered at Heroes Lounge.
      heroesloungeApi.getSlothByDiscordId(member.user.id).then((sloths: Sloth[]) => {
        if (sloths.length > 0) {
          const returningSloth = sloths[0];
          const regionRoleIds: {[key: number]: string} = {
            1: 'EU',
            2: 'NA'
          };

          const regionRole = guild.roles.find((role) => {
            return role.name === regionRoleIds[returningSloth.region_id];
          });

          if (!regionRole) {
            throw Error(`Could not match region id ${returningSloth.region_id} to region role in guild ${guild.name} for ${returningSloth.title}`);
          }

          guild.addMemberRole(member.user.id, regionRole.id).catch((error) => {
            Logger.warn(`Unable to reassign region role to ${member.user.username}`, error);
          });
        }
      }).catch((error: Error) => {
        Logger.error('Unable to verify sloth on website', error);
      });    
    }
  });
};
