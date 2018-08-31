const FileHandler = require('../util/FileHandler.js')
const path = require('path')
const {webhooks} = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.id, webhooks.token)

module.exports = (bot) => {
  bot.on('guildMemberAdd', (guild, member) => {
    FileHandler.readJSONFile(path.join(__dirname, '../Data/Muted.json')).then((data) => {
      const isMutedMember = Object.keys(data).some((d) => d === member.user.id)
      if (isMutedMember) {
        const mutedRole = guild.roles.find((role) => {
          return role.name === 'Muted'
        })

        bot.addGuildMemberRole(guild.id, member.user.id, mutedRole.id, 'Attempted to circumvent mute')
        webhook.send({
          title: 'Attempt at avoiding mute',
          color: bot.embed.color,
          description: `:exclamation: User ${member.user.username} attempted to circumvent their mute on ${guild.name}`
        })
      }
    })
  })
}
