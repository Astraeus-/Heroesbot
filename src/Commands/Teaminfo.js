const BaseCommand = require('../Classes/BaseCommand.js')
const heroesloungeApi = require('heroeslounge-api')
const Logger = require('../util/Logger.js')

const FileHandler = require('../util/FileHandler.js')
const path = require('path')

class Teaminfo extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['vip_lounge', 'match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12'],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff', 'VIP'],
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
    if (args.length < this.min_args) return this.bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage('Invalid number of arguments'))
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

    FileHandler.readJSONFile(path.join(__dirname, '../Data/Teamdata.json')).then(async (teams) => {
      let selectedTeam = teams.find((team) => {
        return team.slug.toLowerCase() === args.join(' ').toLowerCase()
      })

      if (!selectedTeam) return null

      let teamInfo = await heroesloungeApi.getTeamInfo(selectedTeam.id).catch((error) => {
        throw error
      })

      let creationDate = teamInfo.created_at.slice(0, 10).split('-')
      creationDate = `${creationDate[2]}-${creationDate[1]}-${creationDate[0]}`
      embed.title = teamInfo.title
      embed.description = `${teamInfo.short_description.replace(/<(.|\n)*?>/g, '')}\n\nCreated on: ${creationDate}`
      embed.url = `https://heroeslounge.gg/team/view/${teamInfo.slug.replace(' ', '%20')}`
      embed.thumbnail = {
        'url': teamInfo.logo.path || 'https://heroeslounge.gg/plugins/rikki/heroeslounge/assets/img/bg_75.png'
      }

      for (let sloth of teamInfo.sloths) {
        embed.fields[0].value += `${sloth.title}\n`
        embed.fields[1].value += `${sloth.battle_tag}\n`
      }

      for (let field in embed.fields) {
        if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None'
      }

      return embed
    }).then((embed) => {
      if (embed) {
        msg.channel.createMessage({
          embed: embed
        })
      } else {
        this.bot.getDMChannel(msg.author.id).then((channel) => {
          channel.createMessage(`Team with SLUG ${args} does not exist`)
        })
      }
    }).catch((error) => {
      Logger.error(`Could not fetch team info for team with SLUG: ${args.join(' ')}`, error)
    })
  }
}

module.exports = Teaminfo
