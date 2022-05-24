import Eris, {Constants, GuildChannel, TextChannel} from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import {Logger} from '../util';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import {defaultServer} from '../config';
import { Team } from 'heroeslounge-api';

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

    super(name, description, options, type);
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
    if (!botClient)
      return interaction.createFollowup({
        content: 'Could not find self',
        flags: Constants.MessageFlags.EPHEMERAL,
      });

    if (!botClient.permissions.has('manageChannels') || !syncChannel.permissionsOf(botClient.id).has('manageRoles')) {
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
    const teams = await this.getAramTeams(playoffID);

    let errorMessage = '';
    const syncedCaptains = [];

    // Delete all of the existing captains.
    syncChannel.permissionOverwrites.map(async(permission) => {
      if (permission.type === Constants.PermissionOverwriteTypes.USER) {
        await syncChannel.deletePermission(permission.id);
      }
    });

    for (const team of teams) {
      if (!team.sloths || team.sloths.length === 0 || team.disbanded === 1) {
        errorMessage += `No sloths for ${team.title}\n`;
        continue;
      }

      const captainSloth = team.sloths.find(sloth => sloth.pivot.is_captain === 1);
      if (!captainSloth) {
        errorMessage += `No captain for ${team.title}\n`;
        continue;
      }

      if (captainSloth.discord_id.length === 0) {
        errorMessage += `No discord id for ${team.sloths[0].title} from ${team.title}\n`;
        continue;
      }

      const member = syncChannel.guild.members.get(captainSloth.discord_id);
      if (!member) {
        errorMessage += `Captain not on discord for ${team.title} member ${captainSloth.title}\n`;
        continue;
      }

      const syncTask = syncChannel.editPermission(captainSloth.discord_id, 1024, 0, Constants.PermissionOverwriteTypes.USER).catch((error) => {
        Logger.warn(`Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth.title}`, error);
        errorMessage += `Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth.title}\n`;
      });

      syncedCaptains.push(syncTask);
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
    const teamsByDivision: Promise<Team[]>[] = [];
  
    for (const division of playoffDivisions) {
      teamsByDivision.push(HeroesLoungeApi.getDivisionTeams(division.id));
    }
  
    return Promise.all(teamsByDivision).then((divisionTeams) => {
      return divisionTeams.flat();
    });
  }
}
