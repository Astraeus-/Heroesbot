
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { embedDefault } = require('../config.js');
const { Logger } = require('../util.js');

class CurrentBans extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20', 'devops'],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'currentbans',
      'category': 'competition',
      'aliases': ['bans'],
      'description': 'Lists all of the current bans and bugs for the Amateur League.',
      'syntax': 'currentbans'
    };

    super(permissions, options);
  }

  exec (msg) {
    const embed = {
      title: 'Heroes Lounge Amateur League',
      color: embedDefault.color,
      description: '[Current bans and known bugs](https://heroeslounge.gg/general/ruleset)',
      fields: [
        {
          name: 'Banned Heroes',
          value: '',
          inline: true
        },
        {
          name: 'Banned Bugs',
          value: '',
          inline: true
        },
        {
          name: 'Banned Talents',
          value: '',
          inline: true
        }
      ]
    };

    msg.channel.sendTyping();

    return heroesloungeApi.getBans().then(async (bans) => {
      if (bans.length === 0) return null;

      for (const ban of bans) {
        if (ban.literal) {
          embed.fields[1].value += `-${ban.literal}\n`;
        } else {
          if (ban.talent_id) {
            const talent = await heroesloungeApi.getTalent(ban.talent_id).catch((error) => {
              Logger.warn('Unable to get talent info', error);
            });
            const hero = await heroesloungeApi.getHero(ban.hero_id).catch((error) => {
              Logger.warn('Unable to get hero info', error);
            });
            embed.fields[2].value += `-${hero.title}- ${talent.title}\n`;
          } else {
            const hero = await heroesloungeApi.getHero(ban.hero_id).catch((error) => {
              Logger.warn('Unable to get hero info', error);
            });

            const roundStart = ban.round_start ? ban.round_start : '';
            const roundEnd = ban.round_length ? parseInt(roundStart) + parseInt(ban.round_length) : '';
            const roundInfo = roundStart && roundEnd ? `Rounds[${roundStart}-${roundEnd}]` : '';
            embed.fields[0].value += `-${hero.title} ${roundInfo}\n`;
          }
        }
      }

      for (const field in embed.fields) {
        if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None';
      }

      return embed;
    }).then((embed) => {
      if (!embed) {
        return msg.channel.createMessage('There are currently no additional bans');
      } else {
        return msg.channel.createMessage({ embed: embed });
      }
    });
  }
}

module.exports = CurrentBans;
