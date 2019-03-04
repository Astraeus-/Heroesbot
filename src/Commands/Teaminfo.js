const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const heroesloungeApi = require('heroeslounge-api')

const CacheManager = require('../util/CacheManager.js')

class Teaminfo extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['vip_lounge', 'match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators', 'VIP'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'teaminfo',
      aliases: ['team'],
      description: 'Returns info about a specified team.',
      syntax: 'teaminfo [SLUG]',
      min_args: 1
    }

    super(permissions, options)
    this.bot = bot
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
    }

    CacheManager.fetchCache('teams', 24 * 60 * 60 * 1000).then(async (cache) => {
      const teams = cache.data
      const selectedTeam = teams.find((team) => {
        return team.slug.toLowerCase() === args.join(' ').toLowerCase()
      })

      if (!selectedTeam) return null

      return heroesloungeApi.getTeam(selectedTeam.id)
    }).then(async (team) => {
      if (!team) return null

      const teamSloths = await heroesloungeApi.getTeamSloths(team.id).catch((error) => {
        Logger.warn(`Unable to get team sloths for ${team.title}`, error)
      })

      const teamLogo = await heroesloungeApi.getTeamLogo(team.id).catch((error) => {
        Logger.warn(`Unable to get team logo for ${team.title}`, error)
      })

      let creationDate = team.created_at.slice(0, 10).split('-')
      creationDate = `${creationDate[2]}-${creationDate[1]}-${creationDate[0]}`
      embed.title = team.title
      embed.description = `${team.short_description.replace(/<(.|\n)*?>/g, '')}\n\nCreated on: ${creationDate}`
      embed.url = `https://heroeslounge.gg/team/view/${team.slug.replace(' ', '%20')}`
      embed.thumbnail = {
        'url': teamLogo.path || 'https://heroeslounge.gg/plugins/rikki/heroeslounge/assets/img/bg_75.png'
      }

      for (let sloth of teamSloths) {
        embed.fields[0].value += `${sloth.title}\n`
        embed.fields[1].value += `${sloth.battle_tag}\n`
      }

      for (let field in embed.fields) {
        if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None'
      }

      return embed
    }).then((embed) => {
      if (embed) {
        return msg.channel.createMessage({ embed: embed })
      } else {
        return this.bot.getDMChannel(msg.author.id).then((channel) => {
          return channel.createMessage(`Team with SLUG ${args} does not exist`)
        })
      }
    }).catch((error) => {
      Logger.error('Unable to provide team info', error)
    })
  }
}

module.exports = Teaminfo
