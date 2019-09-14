const permissions = require('./permissions.json');
const options = require('./options.json');

const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');
const heroesloungeApi = require('heroeslounge-api');

class CurrentBans extends BaseCommand {
  constructor (bot) {
    super(permissions, options);
    this.bot = bot;
  }

  exec (msg) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
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
