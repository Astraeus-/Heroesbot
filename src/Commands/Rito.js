const BaseCommand = require('../Classes/BaseCommand.js')
const {memeCooldown} = require('../config.json')
const Logger = require('../util/Logger.js')

class Rito extends BaseCommand {
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
      command: 'rito',
      description: 'Have Heroesbot join in on the rito',
      cooldown: memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      ':fire_:369251928250515486',
      '🔫',
      ':RageSloth:438468862967545869',
      '🗡',
      '🔥'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji)
        .catch(error => Logger.warn(`Could not add emoji ${emoji}`, error))
    }
  }
}

module.exports = Rito
