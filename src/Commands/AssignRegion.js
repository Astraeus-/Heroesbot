const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

const heroesloungeApi = require('heroeslounge-api')

class AssignRegion extends BaseCommand {
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
      command: 'assignregion',
      aliases: [],
      description: 'Assigns the EU or NA region to all the registered website users.',
      syntax: 'assignregion',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const guildId = '200267155479068672'

    heroesloungeApi.getSloths(5).then((sloths) => {
      let slothsProcessed = 0
      sloths.forEach((sloth, index, array) => {
        slothsProcessed++
        if (slothsProcessed % 100 === 0) console.log(`Updated members: ${slothsProcessed}`)
        // Check if we have a discord id for the user.
        if (sloth.discord_id.length === 0) return

        const member = this.bot.guilds.get(guildId).members.get(sloth.discord_id)
        if (!member) return

        const roles = member.roles
        let regionRoleId
        if (sloth.region_id === '1') {
          regionRoleId = '494534903547822105' // EU
        } else if (sloth.region_id === '2') {
          regionRoleId = '494535033722372106' // NA
        } else {
          return
        }

        // User already has regionRole trying to assign.
        if (roles.includes(regionRoleId)) return

        // Remove NA region role if region changed to EU.
        if (sloth.region_id === '1' && roles.includes('494535033722372106')) {
          this.bot.removeGuildMemberRole(guildId, sloth.discord_id, '494535033722372106')
            .catch(error => Logger.error(`Error removing old region role from ${sloth.discord_tag}`, error))
        }
        // Remove EU region role if region changed to NA.
        if (sloth.region_id === '2' && roles.includes('494534903547822105')) {
          this.bot.removeGuildMemberRole(guildId, sloth.discord_id, '494534903547822105')
            .catch(error => Logger.error(`Error removing old region role from ${sloth.discord_tag}`, error))
        }

        this.bot.addGuildMemberRole(guildId, sloth.discord_id, regionRoleId)
          .catch(error => Logger.error(`Error assigning region role to ${sloth.discord_tag}`, error))

        if (slothsProcessed === array.length) {
          console.log('All processed!')
        }
      })
    }).catch(error => Logger.error('Error getting list of all sloths', error))
  }
}

module.exports = AssignRegion
