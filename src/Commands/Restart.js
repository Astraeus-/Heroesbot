const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

const { exec } = require('child_process')

class Restart extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016', '202174629245222912']
      }
    }

    const options = {
      prefix: '!',
      command: 'restart',
      description: 'Restarts elements of thee host OS.',
      syntax: 'restart <option>\nOptions are: network, all',
      ignoreInHelp: true,
      min_args: 1
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    if (this.bot.user.id === '321643992624267265') return

    if (args[0] === 'all') {
      Logger.info('Restarting Heroesbot host, please wait...')
      exec('sudo /sbin/reboot', (error) => {
        if (error) Logger.error('Error restarting Heroesbot', error)
      })
    } else if (args[0] === 'network') {
      Logger.info('Restarting Heroesbot networking, please wait...')
      exec('sudo ifconfig wlan0 down', (error) => {
        if (error) Logger.error('Error disabling networking service Heroesbot', error)
      })

      setTimeout(() => {
        exec('sudo ifconfig wlan0 up', (error) => {
          if (error) Logger.error('Error enabling networking service Heroesbot', error)
        })
      }, 3000)
    } else {
      this.bot.getDMChannel(msg.author.id)
        .then(channel => channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`))
        .catch(error => Logger.warn('Could not inform invalid syntax', error))
    }
  }
}

module.exports = Restart
