import Eris, {Constants, Guild, GuildChannel} from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import {Logger, regions} from '../util';
import {defaultServer} from '../config';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import { Sloth } from '../types';

export default class AssignRegion extends BaseInteraction {
  constructor() {
    const name = 'AssignRegion';
    const description = 'Assigns the EU or NA region to all the registered website users';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const enabled = false;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type, enabled);
  }

  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge(Constants.MessageFlags.EPHEMERAL);

    if (!(interaction.channel instanceof GuildChannel) || interaction.channel.guild.id !== defaultServer) {
      return interaction.createFollowup({
        content: 'Invalid guild',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    try {
      const guild = interaction.channel.guild;
      await this.syncRegionRoles(guild);

      return interaction.createFollowup({content: 'Completed region sync', flags: Constants.MessageFlags.EPHEMERAL});
    } catch (error: any) {
      Logger.error('Error syncing all region roles', error);
      return interaction.createFollowup({content: `Error syncing all region roles: ${error}`, flags: Constants.MessageFlags.EPHEMERAL});
    }
  }

  async syncRegionRoles(guild: Guild) {
    Logger.info('Synchronising region roles');

    const regionIDs: Map<string, number> = new Map();
    const regionDiscordRoleIDs: Map<string, string> = new Map();

    regions.map((region) => {
      if (region.heroesloungeId) {
        regionIDs.set(region.name, region.heroesloungeId);
        const regionRole = guild.roles.find((role) => {
          return role.name.toLowerCase() === region.name;
        });
    
        if (regionRole) {
          regionDiscordRoleIDs.set(region.name, regionRole.id);
        }
      }
    });

    if (regionDiscordRoleIDs.size === 0) {
      throw Error('Could not find region roles');
    }

    const sloths: Sloth[] = await HeroesLoungeApi.getSloths();
    const syncedSloths = [];

    for (let sloth = 0; sloth < sloths.length; sloth++) {
      const currentSloth = sloths[sloth];
      if (currentSloth.discord_id.length === 0) continue;
      if (currentSloth.discord_id === '221678731888951296') continue; // Ignore update spam from Schwifty

      const member = guild.members.get(currentSloth.discord_id);
      if (!member) continue;

      const EU = regionDiscordRoleIDs.get('eu')!;
      const NA = regionDiscordRoleIDs.get('na')!;
      
      let regionRoleID : string;
      if (currentSloth.region_id === 1) {
        regionRoleID = EU;
      } else if (currentSloth.region_id === 2) {
        regionRoleID = NA;
      } else {
        continue;
      }

      const roles = member.roles;
      if (roles.includes(regionRoleID)) continue;

      if (currentSloth.region_id === regionIDs.get('eu') && roles.includes(NA)) {
        guild.removeMemberRole(currentSloth.discord_id, NA).catch((error) => {
          Logger.warn(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      if (currentSloth.region_id === regionIDs.get('na') && roles.includes(EU)) {
        guild.removeMemberRole(currentSloth.discord_id, EU).catch((error) => {
          Logger.warn(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      syncedSloths.push(
        guild.addMemberRole(currentSloth.discord_id, regionRoleID).catch((error) => {
          Logger.warn(`Error assigning region role to ${currentSloth.discord_tag}`, error);
        })
      );
    }

    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Region role synchronisation complete, updated ${syncedSloths.length} ${syncedSloths.length === 0 || syncedSloths.length > 1 ? 'users' : 'user'}`);
      return 'Region role synchronisation complete';
    });
  }
}
