const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

class Restart extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '!',
      command: 'restart',
      description: 'Restarts the host OS.',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    if (this.bot.user.id === '321643992624267265') return
    Logger.info('Restarting Heroesbot and host, please wait...')
    require('child_process').exec('sudo /sbin/reboot', (msg) => {
      Logger.info(msg)
    })
  }
}

module.exports = Restart
