
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { embedDefault } = require('../config.js');
const { Logger } = require('../util.js');

const CacheManager = require('../Caches/Teams.js');

class Teaminfo extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['vip_lounge', 'match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20'],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'teaminfo',
      'category': 'competition',
      'aliases': ['team'],
      'description': 'Returns info about a specified team.',
      'syntax': 'teaminfo [SLUG]',
      'min_args': 1
    };
    
    super(permissions, options);
  }

  exec (msg, args) {
    const embed = {
      color: embedDefault.color,
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
