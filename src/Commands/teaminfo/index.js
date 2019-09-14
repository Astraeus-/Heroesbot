const permissions = require('./permissions.json');
const options = require('./options.json');
const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

const CacheManager = require('../../Caches/Teams.js');
const heroesloungeApi = require('heroeslounge-api');

class Teaminfo extends BaseCommand {
  constructor (bot) {
    super(permissions, options);
    this.bot = bot;
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      fields: [
        {
          name: 'Players',
          value: '',
          inline: true
        },
        {
          name: 'Battlenet tag',
          value: '',
          inline: true
        }
      ]
    };

    return CacheManager.fetchCache(24 * 60 * 60 * 1000).then(async (cache) => {
      const teams = cache.data;
      const selectedTeam = teams.find((team) => {
        return team.slug.toLowerCase() === args.join(' ').toLowerCase();
      });

      if (!selectedTeam) return null;

      return heroesloungeApi.getTeam(selectedTeam.id);
    }).then(async (team) => {
      if (!team) return null;

      const teamLogo = await heroesloungeApi.getTeamLogo(team.id).catch((error) => {
        Logger.warn(`Unable to get team logo for ${team.title}`, error);
      });

      let creationDate = team.created_at.slice(0, 10).split('-');
      creationDate = `${creationDate[2]}-${creationDate[1]}-${creationDate[0]}`;
      embed.title = team.title;
      embed.description = `${team.short_description.replace(/<(.|\n)*?>/g, '')}\n\nCreated on: ${creationDate}`;
      embed.url = `https://heroeslounge.gg/team/view/${team.slug.replace(' ', '%20')}`;
      embed.thumbnail = {
        url: teamLogo.path || 'https://heroeslounge.gg/plugins/rikki/heroeslounge/assets/img/bg_75.png'
      };

      for (const sloth of team.sloths) {
        embed.fields[0].value += `[${sloth.title}](https://heroeslounge.gg/user/view/${sloth.id})\n`;
        embed.fields[1].value += `${sloth.battle_tag}\n`;
      }

      for (const field in embed.fields) {
        if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None';
      }

      return embed;
    }).then((embed) => {
      if (embed) {
        return msg.channel.createMessage({ embed: embed });
      } else {
        return msg.author.getDMChannel().then((channel) => {
          return channel.createMessage(`Team with SLUG ${args} does not exist`);
        });
      }
    });
  }
}

module.exports = Teaminfo;
