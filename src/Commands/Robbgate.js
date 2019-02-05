const BaseCommand = require('../Classes/BaseCommand.js')
const { memeCooldown } = require('../config.json')
const Logger = require('../util/Logger.js')

class Robbgate extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators', 'VIP'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '#',
      command: 'robbgate',
      description: 'Recalls the #Robbgate event',
      cooldown: memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      '#⃣',
      '🇷',
      '🇴',
      '🇧',
      ':b_:369122821600968705',
      '🇬',
      '🇦',
      '🇹',
      '🇪'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error)
      })
    }
  }
}

module.exports = Robbgate
