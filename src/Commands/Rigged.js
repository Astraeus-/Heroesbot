const BaseCommand = require('../Classes/BaseCommand.js')
const {memeCooldown} = require('../config.json')
const Logger = require('../util/Logger.js')

class Rigged extends BaseCommand {
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
      command: 'rigged',
      description: 'Loungebot agrees that rigging has occured',
      cooldown: memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      '🇷',
      '🇮',
      '🇬',
      ':g_:364475638297657345',
      '🇪',
      '🇩',
      ':BabyRage:438477910899163157'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji)
        .catch(error => Logger.warn(`Could not add emoji ${emoji}`, error))
    }
  }
}

module.exports = Rigged
