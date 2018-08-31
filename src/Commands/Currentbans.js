const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const heroesloungeApi = require('heroeslounge-api')

class Currentbans extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20', 'devops'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'currentbans',
      aliases: ['bans'],
      description: 'Lists all of the current bans and bugs.',
      syntax: 'currentbans'
    }

    super(permissions, options)
    this.bot = bot
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
    }

    msg.channel.sendTyping()

    heroesloungeApi.getBans()
      .then((bans) => {
        if (bans.length === 0) return null

        for (let ban of bans) {
          if (ban.literal) {
            embed.fields[1].value += `-${ban.literal}\n`
          } else {
            if (ban.talent) {
              embed.fields[2].value += `-${ban.hero.title}- ${ban.talent.title}\n`
            } else {
              const roundStart = ban.round_start ? ban.round_start : ''
              const roundEnd = ban.round_length ? parseInt(roundStart) + parseInt(ban.round_length) : ''
              const roundInfo = roundStart && roundEnd ? `Rounds[${roundStart}-${roundEnd}]` : ''
              embed.fields[0].value += `-${ban.hero.title} ${roundInfo}\n`
            }
          }
        }

        for (let field in embed.fields) {
          if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None'
        }

        return embed
      })
      .then((embed) => {
        if (!embed) {
          return msg.channel.createMessage('There are currently no additional bans')
            .catch((error) => {
              throw error
            })
        } else {
          return msg.channel.createMessage({embed: embed})
            .catch((error) => {
              throw error
            })
        }
      }).catch(error => Logger.error('Unable to list current bans', error))
  }
}

module.exports = Currentbans
