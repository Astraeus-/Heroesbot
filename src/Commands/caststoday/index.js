const permissions = require('./permissions.json');
const options = require('./options.json');
const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

const heroesloungeApi = require('heroeslounge-api');
const dateformat = require('date-fns/format');
const regions = require('../../util.js').timezone;

class CastsToday extends BaseCommand {
  constructor () {
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
      if (matches.length === 0) return null;

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

      let response = '';

      for (const match in matches) {
        const division = await matchDivisions[match];
        const teams = await matchTeams[match];
        const casters = await matchCasters[match];
        const channels = await matchChannels[match];

        // Skip uncasted matches.
        if (channels.length === 0 || casters.length === 0) continue;

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
        const localMatchTime = new Date(Date.UTC(dateElements[0], dateElements[1], dateElements[2], dateElements[3], dateElements[4], dateElements[5]));
        const time = specifiedRegion === 'na' ? dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'hh:mm a') : dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'HH:mm:');

        // Group all match statement with the same time together.
        if (match > 0 && matches[match].wbp > matches[match - 1].wbp) {
          response += `\nAt ${time}\n`;
        } else if (match > 0 && matches[match].wbp === matches[match - 1].wbp) {
          response += '';
        } else {
          response += `At ${time}\n`;
        }

        response += `${casterList} will be bringing you a ${fixture} match between ${teams[0].title} and ${teams[1].title} on ${channelList}\n`;
      }

      return response;
    }).then((response) => {
      return msg.author.getDMChannel().then((channel) => {
        if (!response) {
          return channel.createMessage('There are no casted matches');
        } else {
          return channel.createMessage(`Region time of: ${timezone}\n\n ${response}`);
        }
      });
    });
  }
}

module.exports = CastsToday;
