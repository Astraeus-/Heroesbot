const BaseCommand = require('../Classes/BaseCommand.js')
const config = require('../config.json')
const Logger = require('../util/Logger.js')

class Petman extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff', 'VIP'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '#',
      command: 'petman',
      description: 'Heroesbot joins in on the Petman chant',
      cooldown: config.memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      ':PetmanPride:438477246706089997',
      '🇵',
      '🇪',
      '🇹',
      '🇲',
      '🇦',
      '🇳',
      ':Petman:438477216108773396'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error)
      })
    }
  }
}

module.exports = Petman