const { webhooks } = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.moderatorLogs.id, webhooks.moderatorLogs.token)
const heroesloungeApi = require('heroeslounge-api')
const { Logger } = require('../util.js')

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

    // Check if the user was already registered at Heroes Lounge.
    heroesloungeApi.getSlothByDiscordId(member.user.id).then((sloths) => {
      if (sloths.length > 0) {
        const returningSloth = sloths[0]
        const regionRoleIds = {
          1: 'EU',
          2: 'NA'
        }

        const regionRole = guild.roles.find((role) => {
          return role.name === regionRoleIds[returningSloth.region_id]
        })

        bot.addGuildMemberRole(guild.id, member.user.id, regionRole.id).catch((error) => {
          Logger.warn(`Unable to reassign region role to ${member.user.username}`, error)
        })

        // if (returningSloth.is_captain === '1' || returningSloth.is_divs_captain === '1') {
        //   const captainRole = guild.roles.find((role) => {
        //     return role.name === 'Captains'
        //   })

        //   bot.addGuildMemberRole(guild.id, member.user.id, captainRole.id).catch((error) => {
        //     Logger.warn(`Unable to reassign captain role to ${member.user.username}`, error)
        //   })
        // }
      }
    }).catch((error) => {
      Logger.error('Unable to verify sloth on website', error)
    })
  })
}
