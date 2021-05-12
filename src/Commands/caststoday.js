
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { Logger } = require('../util.js');

const dateformat = require('date-fns/format');
const regions = require('../util.js').timezone;

class CastsToday extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['casters_lounge'],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators', 'Casters-EU', 'Casters-NA', 'CoCasters', 'External Casters', 'Trial Casters'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'caststoday',
      'category': 'casters',
      'aliases': ['casts'],
      'description': 'Lists all of today"s upcoming casts for the given region.',
      'syntax': 'caststoday <region>',
      'min_args': 1,
      'cooldown': 15000
    };
    
    super(permissions, options);
  }

  exec (msg, args) {
    const specifiedRegion = args[0].toLowerCase();
    const region = regions.find(region => region.name === specifiedRegion);
    const timezone = region && region.timezone ? region.timezone : null;

    if (!timezone) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`The region ${args[0]} is not available`);
      });
    }

    if (msg.channel.guild) {
      msg.author.getDMChannel().then((channel) => {
        return channel.sendTyping();
      }).catch((error) => {
        Logger.warn(`Unable to sendTyping to ${msg.author.username}`, error);
      });
    } else {
      msg.channel.sendTyping().catch((error) => {
        Logger.warn(`Unable to sendTyping to ${msg.channel.name}`, error);
      });
    }

    return heroesloungeApi.getMatchesToday(timezone).then(async (matches) => {
      if (matches.length === 0) return [];

      matches.sort((a, b) => {
        return new Date(a.wbp) - new Date(b.wbp);
      });

      const matchDivisions = [];
      const matchTeams = [];
      const matchChannels = [];
      const matchCasters = [];

      for (const match in matches) {
        matchDivisions[match] = matches[match].div_id ? heroesloungeApi.getDivision(matches[match].div_id).catch((error) => {
          Logger.warn('Unable to get division info', error);
        }) : '';

        matchTeams[match] = heroesloungeApi.getMatchTeams(matches[match].id).catch((error) => {
          Logger.warn('Unable to get match team info', error);
        });

        matchCasters[match] = heroesloungeApi.getMatchCasters(matches[match].id).catch((error) => {
          Logger.warn('Unable to get caster info', error);
        });

        matchChannels[match] = heroesloungeApi.getMatchChannels(matches[match].id).catch((error) => {
          Logger.warn('Unable to get match channel info', error);
        });
      }

      const responseMessages = [];
      let response = '';
      let previousCastedMatchOffset = 1;

      for (const match in matches) {
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
        casters.forEach((caster) => {
          if (casterList.length > 0) casterList += ' and ';
          casterList += `${caster.title}`;
        });

        // Attach all of the channels to the channelList.
        channels.forEach((channel) => {
          if (channelList.length > 0) channelList += ' and ';
          channelList += `**${channel.title}**: <${channel.url}>`;
        });

        // Attach a division name or tournament + group.
        let fixture = '';

        if (division.playoff_id || matches[match].playoff_id) {
          const playoff = matches[match].playoff_id ? await heroesloungeApi.getPlayoff(matches[match].playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error);
          }) : division.playoff_id ? await heroesloungeApi.getPlayoff(division.playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error);
          }) : '';

          fixture = `Heroes Lounge ${playoff.title}${division ? ` ${division.title}` : ''}`;
        } else {
          fixture = division.title;
        }

        const dateElements = matches[match].wbp.match(/\d+/g);
        const localMatchTime = new Date(Date.UTC(dateElements[0], dateElements[1] - 1, dateElements[2], dateElements[3], dateElements[4], dateElements[5]));
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

      return responseMessages;
    }).then((responseMessages) => {
      return msg.author.getDMChannel().then((channel) => {
        if (responseMessages.length === 0) {
          return channel.createMessage('There are no casted matches');
        } else {
          const responses = responseMessages.map((response, index) => {
            if (index == 0) response = `Region time of: ${timezone}\n\n${response}`;
            return channel.createMessage(response);
          });

          return Promise.all(responses);
        }
      });
    });
  }
}

module.exports = CastsToday;
