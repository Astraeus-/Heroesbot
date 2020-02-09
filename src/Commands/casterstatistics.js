
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { embedDefault } = require('../config.js');
const { Logger } = require('../util.js');

class CasterStatistics extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['casters_lounge'],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators', 'Casters-EU', 'Casters-NA'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'casterstatistics',
      'category': 'casters',
      'aliases': ['caststats', 'casterstats'],
      'description': 'Provides you with the casting statistics of the specified season.',
      'syntax': 'casterstats <season>',
      'enabled': false,
      'min_args': 1
    };

    super(permissions, options);
  }

  exec (msg, args) {
    const embed = {
      color: embedDefault.color,
      description: 'Overall casting statistics for season ',
      fields: [
        {
          name: 'Round matches',
          value: '',
          inline: true
        },
        {
          name: 'Casts',
          value: '',
          inline: true
        },
        {
          name: 'Coverage',
          value: '',
          inline: true
        }
      ]
    };

    const season = parseInt(args[0]);
    const seasonId = season - 3; // Id 1 belong to season 4.

    return heroesloungeApi.getSeasonCasterStatistics(seasonId).then((stats) => {
      embed.description += season;
      const roundData = stats.dataByRound;

      for (const entry in roundData) {
        if (parseInt(entry) > 0) {
          embed.fields[0].value += `Round ${entry}: ${roundData[entry].matches} matches\n`;
          embed.fields[1].value += `${roundData[entry].casts}\n`;
          embed.fields[2].value += `${roundData[entry].coverage !== 'undefined' ? roundData[entry].coverage : 0}%\n`;
        }
      }

      msg.channel.createMessage({ embed: embed }).catch((error) => {
        Logger.warn('Could not notify casterstatistics', error);
      });
    });
  }
}

module.exports = CasterStatistics;
