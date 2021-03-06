
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { embedDefault } = require('../config.js');
const { Logger } = require('../util.js');

const CacheManager = require('../Caches/MatchesToday.js');
const dateformat = require('date-fns/format');
const regions = require('../util.js').timezone;

class MatchesToday extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': [],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'matchestoday',
      'category': 'competition',
      'aliases': ['upcomingmatches', 'today', 'todaymatches'],
      'description': 'Lists all of today"s upcoming matches for the specified region',
      'syntax': 'matchestoday <region>',
      'min_args': 1,
      'cooldown': 10000
    };
    
    super(permissions, options);
  }

  exec (msg, args) {
    const embed = {
      color: embedDefault.color,
      description: '[Matches Today](https://heroeslounge.gg/calendar)',
      fields: [
        {
          name: 'Fixture',
          value: '',
          inline: true
        },
        {
          name: 'Match Details',
          value: '',
          inline: true
        },
        {
          name: 'Cast',
          value: '',
          inline: true
        }
      ]
    };

    let Embeds = [];
    let embedCounter = 0;

    Embeds[embedCounter] = JSON.parse(JSON.stringify(embed));

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

    return CacheManager.fetchCache(specifiedRegion, 15 * 60 * 1000).then(async (cache) => {
      const matches = cache.data;
      if (matches.length === 0) return null;

      matches.sort((a, b) => {
        return new Date(a.wbp) - new Date(b.wbp);
      });

      const matchDivisions = [];
      const matchTeams = [];
      const matchChannels = [];

      for (const match in matches) {
        matchDivisions[match] = matches[match].div_id ? heroesloungeApi.getDivision(matches[match].div_id).catch((error) => {
          Logger.warn('Unable to get division info', error);
        }) : '';

        matchTeams[match] = heroesloungeApi.getMatchTeams(matches[match].id).catch((error) => {
          Logger.warn('Unable to get match team info', error);
        });

        matchChannels[match] = heroesloungeApi.getMatchChannels(matches[match].id).catch((error) => {
          Logger.warn('Unable to get match channel info', error);
        });
      }

      for (const match in matches) {
        const teams = await matchTeams[match];
        const division = await matchDivisions[match];
        const channels = await matchChannels[match];
        const matchURL = 'https://heroeslounge.gg/match/view/' + matches[match].id;

        // Attach a division name or tournament + group.
        let fixture = '';

        if (division.playoff_id || matches[match].playoff_id) {
          const playoff = matches[match].playoff_id ? await heroesloungeApi.getPlayoff(matches[match].playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error);
          }) : division.playoff_id ? await heroesloungeApi.getPlayoff(division.playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error);
          }) : '';

          switch (playoff.type) {
          case 'playoffv1':
            fixture = `${playoff.title} ${division ? division.title : ''}`;
            break;
          case 'playoffv2':
          case 'playoffv3':
            fixture = `${playoff.title.split(' ')[0]} ${division ? division.title : ''}`;
            break;
          case 'se16':
          case 'se32':
          case 'se64':
          case 'se128':
            fixture = `${playoff.title}${division ? ` ${division.title}` : ''}`;
            break;
          default:
            fixture = `${playoff.title}${division ? ` ${division.title}` : ''}`;
          }
        } else {
          fixture = division.title;
        }

        if (Embeds[embedCounter].fields[1].value.length >= 950) {
          embedCounter++;
          Embeds = addEmbed(embed, Embeds, embedCounter);
        }

        const dateElements = matches[match].wbp.match(/\d+/g);
        const localMatchTime = new Date(Date.UTC(dateElements[0], dateElements[1] - 1, dateElements[2], dateElements[3], dateElements[4], dateElements[5]));
        const time = specifiedRegion === 'na' ? dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'hh:mm a') : dateformat(new Date(localMatchTime.toLocaleString('Ger', { timeZone: timezone })), 'HH:mm:');

        const leftTeamSlug = teams[0] ? teams[0].slug : 'TBD';
        const rightTeamSlug = teams[1] ? teams[1].slug : 'TBD';

        Embeds[embedCounter].fields[0].value += `${time} ${fixture}\n`;
        Embeds[embedCounter].fields[1].value += `[${leftTeamSlug} Vs ${rightTeamSlug}](${matchURL})\n`;

        if (channels.length > 0) {
          for (let i = 0; i < channels.length; i++) {
            Embeds[embedCounter].fields[2].value += `[[${i + 1}]](${channels[i].url})`;
          }
        } else {
          Embeds[embedCounter].fields[2].value += 'No';
        }
        Embeds[embedCounter].fields[2].value += '\n';
      }

      return Embeds;
    }).then((Embeds) => {
      return msg.author.getDMChannel().then((channel) => {
        if (!Embeds) {
          return channel.createMessage('There are no upcoming matches');
        } else {
          return sendMatchesTodayResponse(channel, Embeds);
        }
      });
    });
  }
}

const addEmbed = (embed, Embeds, embedCounter) => {
  Embeds[embedCounter] = JSON.parse(JSON.stringify(embed));
  delete Embeds[embedCounter].description;
  return Embeds;
};

const sendMatchesTodayResponse = (channel, Embeds) => {
  const response = [];

  for (const embed in Embeds) {
    response.push(
      channel.createMessage({ embed: Embeds[embed] }).catch((error) => {
        throw error;
      }));
  }

  return Promise.all(response);
};

module.exports = MatchesToday;

