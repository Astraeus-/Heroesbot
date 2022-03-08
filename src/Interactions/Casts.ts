import Eris, { Constants } from 'eris';
import HeroesloungeApi from '../Classes/HeroesLounge';
import BaseInteraction from '../Classes/BaseInteraction';
import { Logger, regions } from '../util';
import { Playoff, Team, TwitchChannel } from 'heroeslounge-api';
import { Caster } from '../types';

export default class Casts extends BaseInteraction {
  constructor() {
    const name = 'Casts';
    const description = 'Lists of all of today\'s upcoming casts for the given region';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'region',
        description: 'Timezone region',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
        choices: [
          {name: 'EU', value: 'eu'},
          {name: 'NA', value: 'na'},
        ],
      },
    ];

    const permissions = new Array<Eris.ApplicationCommandPermissions>();

    super(name, description, options, type, permissions);
  }

  async execute (interaction: Eris.CommandInteraction) {
    const specifiedRegion = this.getStringValueFromCommandInteraction('region', interaction);
    const region = specifiedRegion && regions.find(region => region.name === specifiedRegion);
    const timezone = region && region.timezone ? region.timezone : null;

    await interaction.acknowledge(Constants.InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);

    if (!timezone) {
      return interaction.createFollowup({
        content: `The region ${specifiedRegion} is not available`,
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const matches = await HeroesloungeApi.getMatchesToday(timezone);
    if (!matches || matches.length === 0) {
      return interaction.createFollowup({
        content: 'There are no casted matches',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    matches.sort((a, b) => {
      return new Date(a.wbp).getTime() - new Date(b.wbp).getTime(); 
    });

    const matchDivisions = [];
    const matchTeams = [];
    const matchChannels = [];
    const matchCasters = [];

    for (let match = 0; match < matches.length; match++) {
      const currentMatch = matches[match];

      matchDivisions[match] = currentMatch.div_id !== null ? HeroesloungeApi.getDivision(currentMatch.div_id).catch((error: Error) => {
        Logger.warn('Unable to get division info', error);
      }) : '';

      matchTeams[match] = HeroesloungeApi.getMatchTeams(currentMatch.id).catch((error: Error) => {
        Logger.warn('Unable to get match team info', error);
      });

      matchCasters[match] = HeroesloungeApi.getMatchCasters(currentMatch.id).catch((error: Error) => {
        Logger.warn('Unable to get caster info', error);
      });

      matchChannels[match] = HeroesloungeApi.getMatchChannels(currentMatch.id).catch((error: Error) => {
        Logger.warn('Unable to get match channel info', error);
      });
    }

    const responseMessages = [];
    let response = '';
    let previousCastedMatchOffset = 1;

    for (let match = 0; match < matches.length; match++) {
      const division = await matchDivisions[match];
      const teams: Team[] | void = await matchTeams[match];
      const casters = await matchCasters[match];
      const channels = await matchChannels[match];

      // Skip uncasted matches.
      if (channels && channels.length === 0 || casters && casters.length === 0) {
        previousCastedMatchOffset++;
        continue;
      }

      let casterList = '';
      let channelList = '';

      // Attach all of the casters to the casterList.
      if (casters) {
        casters.forEach((caster: Caster) => {
          if (caster.pivot && caster.pivot.approved === 1) {
            if (casterList.length > 0)
              casterList += ' and ';

            casterList += `${caster.title}`;
          }          
        });
      }

      // Attach all of the channels to the channelList.
      if (channels) {
        channels.forEach((channel: TwitchChannel) => {
          if (channelList.length > 0) channelList += ' and ';
          channelList += `**${channel.title}**: <${channel.url}>`;
        });
      }

      // Attach a division name or tournament + group.
      let fixture = '';
      let playoff: Playoff | void;

      if (typeof division === 'string') {
        const currentMatch = matches[match];
        if (currentMatch.playoff_id !== null) {
          playoff = await HeroesloungeApi.getPlayoff(currentMatch.playoff_id).catch((error: Error) => {
            Logger.warn('Unable to get playoff info', error);
          });
        }
      } else {
        if (division && division.playoff_id) {
          playoff = await HeroesloungeApi.getPlayoff(division.playoff_id).catch((error: Error) => {
            Logger.warn('Unable to get playoff info', error);
          });
        }
      }
  
      fixture = `Heroes Lounge ${playoff ? playoff.title : ''}${division && (typeof division !== 'string') ? `${division.title}` : ''}`;

      const dateElements = matches[match].wbp.match(/\d+/g);
      const localMatchTime = Date.UTC(
        /* eslint-disable  @typescript-eslint/no-non-null-assertion */
        Number.parseInt(dateElements![0]),
        Number.parseInt(dateElements![1]) - 1,
        Number.parseInt(dateElements![2]),
        Number.parseInt(dateElements![3]),
        Number.parseInt(dateElements![4]),
        Number.parseInt(dateElements![5])
        /* eslint-enable  @typescript-eslint/no-non-null-assertion */
      );

      const locale = specifiedRegion === 'na' ? 'en-US' : 'en-GB';
      const formatter = new Intl.DateTimeFormat(locale, {
        hour: 'numeric', minute: 'numeric',
        timeZone: timezone,
        timeZoneName: 'short',
      });

      const time = formatter.format(localMatchTime);

      // Group all match statement with the same time together.
      if (match - previousCastedMatchOffset >= 0 && matches[match].wbp > matches[match - previousCastedMatchOffset].wbp) {
        response += `\nAt ___${time}___\n`;
      } else if (match - previousCastedMatchOffset >= 0 && matches[match].wbp === matches[match - previousCastedMatchOffset].wbp) {
        response += '';
      } else {
        response += `At ___${time}___\n`;
      }

      if (!teams) {
        continue;
      }

      const leftTeam: Team = teams[0];
      const teamLeftTitle = leftTeam !== null ? leftTeam.title : 'TBD';

      const rightTeam: Team = teams[1];
      const teamRightTitle = rightTeam !== null ? rightTeam.title: 'TBD';

      response += `**${casterList}** will be bringing you a ${fixture} match between *${teamLeftTitle}* and *${teamRightTitle}* on ${channelList}\n`;
      previousCastedMatchOffset = 1;

      if (response.length >= 1800) {
        responseMessages.push(response);
        response = '';
      }
    }

    if (response.length > 0) {
      responseMessages.push(response);
    }

    if (responseMessages.length === 0) {
      return interaction.createFollowup({
        content: 'There are no casted matches',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    responseMessages.map((response, index) => {
      if (index == 0) response = `Region time of: ${timezone}\n\`\`\`\n${response}\n\`\`\``;

      return interaction.createFollowup({
        content: response,
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    });
  }
}
