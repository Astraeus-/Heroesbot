const { webhooks } = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.id, webhooks.token)
const heroesloungeApi = require('heroeslounge-api')
const Logger = require('../util/Logger.js')

const fs = require('fs').promises
const path = require('path')

module.exports = (bot) => {
  bot.on('guildMemberAdd', (guild, member) => {
    // Check if the member is not trying to circumvent their mute.
    fs.readFile(path.join(__dirname, '../Data/Muted.json'), { encoding: 'utf8' }).then((data) => {
      const isMutedMember = Object.keys(data).some((d) => d === member.user.id)
      if (isMutedMember) {
        const mutedRole = guild.roles.find((role) => {
          return role.name === 'Muted'
        })

        bot.addGuildMemberRole(guild.id, member.user.id, mutedRole.id, 'Attempted to circumvent mute').catch((error) => {
          Logger.error(`Unable to reassign muted role to ${member.user.username}`, error)
        })
        webhook.send({
          title: 'Attempt at avoiding mute',
          color: bot.embed.color,
          description: `:exclamation: User ${member.user.username} attempted to circumvent their mute on ${guild.name}`
        })
      }
    }).catch((error) => {
      Logger.warn(`Unable to check mute ${member.user.username}#${member.user.discriminator}`, error)
    })

    // Assign the EU or NA role for returning Discord members.
    heroesloungeApi.getSlothByDiscordId(member.user.id).then((sloth) => {
      if (sloth.length > 0) {
        let returningSloth = sloth[0]
        let regionRoleId
        if (returningSloth.region_id === '1') {
          regionRoleId = '494534903547822105' // EU
        } else if (returningSloth.region_id === '2') {
          regionRoleId = '494535033722372106' // NA
        }

        bot.addGuildMemberRole(guild.id, member.user.id, regionRoleId).catch((error) => {
          Logger.error(`Unable to reassign region role to ${member.user.username}`, error)
        })
      }
    }).catch((error) => {
      Logger.error('Unable to verify sloth on website', error)
    })
  })
}
