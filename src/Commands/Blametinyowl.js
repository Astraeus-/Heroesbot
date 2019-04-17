const BaseCommand = require('../Classes/BaseCommand.js')
const { memeCooldown } = require('../config.json')
const { Logger } = require('../util.js')

class Blametinyowl extends BaseCommand {
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
      command: 'blametinyowl',
      description: 'Responds blaming tinyowl',
      cooldown: memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      '#⃣',
      '🇧',
      '🇱',
      '🇦',
      '🇲',
      '🇪',
      '🇹',
      '🇮',
      '🇳',
      '🇾',
      '🇴',
      '🇼',
      ':l_:369122853460770828',
      '🦉'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error)
      })
    }
  }
}

module.exports = Blametinyowl
