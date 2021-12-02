import Eris, { Constants, Guild, GuildChannel } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import { defaultServer } from '../config';
import { Sloth } from '../types';
import { Logger } from '../util';

export default class AssignCaptain extends BaseInteraction {
  constructor() {
    const name = 'AssignCaptain';
    const description = 'Assign the captain role to all team captains';
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

    const guild = interaction.channel.guild;
    const response = await this.syncCaptains(guild);

    return interaction.createFollowup({
      content: `Updated captains: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`,
      flags: Constants.MessageFlags.EPHEMERAL
    });    
  }

  async syncCaptains(guild: Guild) {
    Logger.info('Synchronising captain roles');

    const teams = await this.getParticipatingTeams();

    let errorMessage = '';
    const syncedSloths = [];

    const captainRole = guild.roles.find((role) => {
      return role.name === 'Captains';
    });

    for (const team of teams) {
      if (team.sloths && team.sloths.length > 0 && team.disbanded === 0) {
        let captainSloth: Sloth;

        for (const sloth of team.sloths) {
          if (sloth.pivot.is_captain === 1) {
            captainSloth = sloth;
            break;
          }
        }

        if (!captainSloth) {
          errorMessage += `No captain for ${team.title}\n`;
          continue;
        }

        if (captainSloth.discord_id.length > 0) {
          const member = guild.members.get(captainSloth.discord_id);

          if (member) {
            if (member.roles.includes(captainRole!.id)) continue;

            syncedSloths.push(
              guild.addMemberRole(captainSloth!.discord_id, captainRole!.id).catch((error) => {
                Logger.warn(`Unable to assign captain for team ${team.title} user ${captainSloth.title}`, error);
                errorMessage += `Unable to assign captain for team ${team.title} user ${captainSloth.title}\n`;
              })
            );
          } else {
            errorMessage += `Captain not on discord for ${team.title} member ${captainSloth.title}\n`;
          }
        } else {
          errorMessage += `No discord id for ${team.sloths[0].title} from ${team.title}\n`;
        }
      } else {
        errorMessage += `No sloths for ${team.title}\n`;
      }
    }

    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Captain role synchronisation complete, updated ${syncedSloths.length} users`);
      return {
        updatedCaptainCounter: syncedSloths.length,
        errorMessage: errorMessage
      };
    });
  }
  
  async getParticipatingTeams() {
    const seasons = await HeroesLoungeApi.getSeasons().catch((error: Error) => {
      throw error;
    });
  
    let teamsByRegion: any[] = [];
    let seasonCounter = 0;
  
    for (let i = seasons.length - 1; i >= 0; i--) {
      if (seasonCounter >= 2) break;
      if (seasons[i].type !== 1) continue; // Only sync Amateur Series seasons.
  
      if (seasons[i].is_active === 1 && seasons[i].reg_open === 0) {
        teamsByRegion = [...teamsByRegion, HeroesLoungeApi.getSeasonTeams(seasons[i].id)];
        seasonCounter++;
      } else if (seasons[i].is_active === 1 && seasons[i].reg_open === 1) {
        seasonCounter++;
      }
    }
  
    return Promise.all(teamsByRegion).then((regionTeams) => {
      let teams: any[] = [];
      for (let i = 0; i < regionTeams.length; i++) {
        teams = [...teams, ...regionTeams[i]];
      }
  
      return teams;
    });
  }
}
