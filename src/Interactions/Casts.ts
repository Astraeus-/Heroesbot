import Eris, { Constants } from 'eris';
import dateformat from 'date-fns/format';
import HeroesloungeApi from '../Classes/HeroesLounge';
import BaseInteraction from '../Classes/BaseInteraction';
import { Logger, regions } from '../util';
import { Match } from '../types';

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

    super(name, description, options, type);
  }

  async execute (interaction: Eris.CommandInteraction) {
    const specifiedRegion = this.getStringValueFromCommandInteraction('region', interaction);
    const region = specifiedRegion && regions.find(region => region.name === specifiedRegion);
    const timezone = region && region.timezone ? region.timezone : null;

    interaction.acknowledge(Constants.InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);

    if (!timezone) {
      return interaction.createFollowup({
        content: `The region ${specifiedRegion} is not available`,
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const matches: Match[] = await HeroesloungeApi.getMatchesToday(timezone);
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
      matchDivisions[match] = matches[match].div_id ? HeroesloungeApi.getDivision(matches[match].div_id).catch((error: Error) => {
        Logger.warn('Unable to get division info', error);
      }) : '';

      matchTeams[match] = HeroesloungeApi.getMatchTeams(matches[match].id).catch((error: Error) => {
        Logger.warn('Unable to get match team info', error);
      });

      matchCasters[match] = HeroesloungeApi.getMatchCasters(matches[match].id).catch((error: Error) => {
        Logger.warn('Unable to get caster info', error);
      });

      matchChannels[match] = HeroesloungeApi.getMatchChannels(matches[match].id).catch((error: Error) => {
        Logger.warn('Unable to get match channel info', error);
      });
    }

    const responseMessages = [];
    let response = '';
    let previousCastedMatchOffset = 1;

    for (let match = 0; match < matches.length; match++) {
      const division = await matchDivisions[match];
      const teams = await matchTeams[match];
      const casters = await matchCasters[match];
      const channels = await matchChannels[match];

      // Skip uncasted matches.
      if (channels.length === 0 || casters.length === 0) {
        previousCastedMatchOffset++;
        continue;
      }

      let casterList = '';
      let channelList = '';

      // Attach all of the casters to the casterList.
      casters.forEach((caster: any) => {
        if (casterList.length > 0) casterList += ' and ';
        casterList += `${caster.title}`;
      });

      // Attach all of the channels to the channelList.
      channels.forEach((channel: any) => {
        if (channelList.length > 0) channelList += ' and ';
        channelList += `**${channel.title}**: <${channel.url}>`;
      });

      // Attach a division name or tournament + group.
      let fixture = '';

      if (division.playoff_id || matches[match].playoff_id) {
        const playoff = matches[match].playoff_id ? await HeroesloungeApi.getPlayoff(matches[match].playoff_id).catch((error: Error) => {
          Logger.warn('Unable to get playoff info', error);
        }) : division.playoff_id ? await HeroesloungeApi.getPlayoff(division.playoff_id).catch((error: Error) => {
          Logger.warn('Unable to get playoff info', error);
        }) : '';

        fixture = `Heroes Lounge ${playoff.title}${division ? ` ${division.title}` : ''}`;
      } else {
        fixture = division.title;
      }

      const dateElements = matches[match].wbp.match(/\d+/g);
      const localMatchTime = new Date(Date.UTC(
        Number.parseInt(dateElements![0]),
        Number.parseInt(dateElements![1]) - 1,
        Number.parseInt(dateElements![2]),
        Number.parseInt(dateElements![3]),
        Number.parseInt(dateElements![4]),
        Number.parseInt(dateElements![5])
      ));
      const time = specifiedRegion === 'na' ? dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'hh:mm a') : dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'HH:mm:');

      // Group all match statement with the same time together.
      if (match - previousCastedMatchOffset >= 0 && matches[match].wbp > matches[match - previousCastedMatchOffset].wbp) {
        response += `\nAt ${time}\n`;
      } else if (match - previousCastedMatchOffset >= 0 && matches[match].wbp === matches[match - previousCastedMatchOffset].wbp) {
        response += '';
      } else {
        response += `At ${time}\n`;
      }

      const teamLeftTitle = teams[0] ? teams[0].title : 'TBD';
      const teamRightTitle = teams[1] ? teams[1].title: 'TBD';

      response += `${casterList} will be bringing you a ${fixture} match between ${teamLeftTitle} and ${teamRightTitle} on ${channelList}\n`;
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
      if (index == 0) response = `Region time of: ${timezone}\n\n${response}`;

      return interaction.createFollowup({
        content: response,
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    });
  }
}
