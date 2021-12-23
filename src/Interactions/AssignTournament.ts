import Eris, {Constants, GuildChannel, TextChannel} from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import {Logger} from '../util';
import { Team, TeamSloth } from 'heroeslounge-api';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import {defaultServer} from '../config';

export default class AssignTournament extends BaseInteraction {
  constructor() {
    const name = 'AssignTournament';
    const description = 'Assigns captains participating in the playoff to the mentioned channel';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'playoff',
        description: 'The ID of the playoff',
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
        required: true,
      },
      {
        name: 'channel',
        description: 'The channel to sync to',
        type: Constants.ApplicationCommandOptionTypes.CHANNEL,
        required: true,
      }
    ];

    const permissions: Eris.ApplicationCommandPermissions[] = [
      {
        id: '200988760027037698', // Lounge master
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
      {
        id: '386451356908781568', // Board
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
      {
        id: '494793884942073856', // Managers
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
    ];

    super(name, description, options, type, permissions);
  }

  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge(Constants.MessageFlags.EPHEMERAL);

    const playoffID = this.getNumberValueFromCommandInteraction('playoff', interaction);
    const syncChannelID = this.getStringValueFromCommandInteraction('channel', interaction);

    if (!playoffID || !syncChannelID) {
      return interaction.createFollowup({content: 'Invalid playoff format or channel', flags: Constants.MessageFlags.EPHEMERAL});
    }

    if (!(interaction.channel instanceof TextChannel) || interaction.channel.guild.id !== defaultServer) {
      return interaction.createFollowup({
        content: 'Invalid channel type or guild',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const syncChannel = interaction.channel.guild.channels.get(syncChannelID);

    if (!syncChannel) {
      return interaction.createFollowup({
        content: 'Invalid channel',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const botClient = interaction.channel.guild.members.get(interaction.channel.client.user.id);

    if (!botClient!.permissions.has('manageChannels') || !syncChannel.permissionsOf(botClient!.id).has('manageRoles')) {
      return interaction.createFollowup({
        content: 'Unable to update captains.\nHeroesbot missing permission: manageChannels',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const response = await this.syncAramCaptainLounge(playoffID, syncChannel);

    return interaction.createFollowup({
      content: `Updated ${syncChannel.name}: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`,
      flags: Constants.MessageFlags.EPHEMERAL,
    });
  }

  async syncAramCaptainLounge(playoffID: number, syncChannel: GuildChannel) {
    Logger.info('Synchronising Aram Captains Lounge');

    const teams: Team[] = (await this.getAramTeams(playoffID)).flat();

    let errorMessage = '';
    const syncedCaptains = [];

    // Delete all of the existing captains.
    syncChannel.permissionOverwrites.map(async(permission) => {
      if (permission.type === Constants.PermissionOverwriteTypes.USER) {
        await syncChannel.deletePermission(permission.id);
      }
    });

    for (const team of teams) {
      if (team.sloths && team.sloths.length > 0 && team.disbanded === 0) {
        let captainSloth: TeamSloth | null = null;

        for (const sloth of team.sloths) {
          if (sloth.pivot.is_captain === 1) {
            captainSloth = sloth;
            break;
          }
        }

        if (captainSloth == null) {
          errorMessage += `No captain for ${team.title}\n`;
          continue;
        }

        if (captainSloth.discord_id.length > 0) {
          const member = syncChannel.guild.members.get(captainSloth.discord_id);

          if (member) {
            syncedCaptains.push(
              syncChannel.editPermission(captainSloth.discord_id, 1024, 0, Constants.PermissionOverwriteTypes.USER).catch((error) => {
                Logger.warn(`Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth!.title}`, error);
                errorMessage += `Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth!.title}\n`;
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

    return Promise.all(syncedCaptains).then(() => {
      Logger.info(`${syncChannel.name} captain synchronisation complete, added ${syncedCaptains.length} users`);
      return {
        updatedCaptainCounter: syncedCaptains.length,
        errorMessage: errorMessage
      };
    });
  }
  
  async getAramTeams(playoffID: number) {
    const playoffDivisions = await HeroesLoungeApi.getPlayoffDivisions(playoffID);
    const teams = [];
  
    for (const division of playoffDivisions) {
      teams.push(HeroesLoungeApi.getDivisionTeams(division.id));
    }
  
    return Promise.all(teams);
  }
}
