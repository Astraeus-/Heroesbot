const { defaultServer, webhooks } = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.moderatorLogs.id, webhooks.moderatorLogs.token)
const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('messageDelete', (msg) => {
    if (msg.channel.guild && msg.channel.guild.id === defaultServer) {
      msg.channel.guild.getAuditLogs(1, null, 72).then((auditlogs) => {
        const entry = auditlogs.entries[0]

        // Checks that the last entry is deleting from the same user that deleted this message
        if (msg.author && msg.author.id === entry.targetID) {
          const webhookResponse = {
            title: 'Message Delete',
            color: 16711680,
            description: `Deleted by: ${entry.user.username}\nChannel: ${entry.channel.name}`
          }

          let embeds = [
            {
              title: 'Message',
              color: 16711680,
              description: msg.cleanContent,
              footer: {
                icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`,
                text: `${msg.author.username}#${msg.author.discriminator}`
              }
            }
          ]

          if (msg.attachments.length > 0) {
            for (let attachment of msg.attachments) {
              embeds.push({
                title: 'Attachment',
                color: 16711680,
                description: `Name: ${attachment.filename}\nURL: ${attachment.proxy_url}`
              })
            }
          }

          webhook.send(webhookResponse, embeds)
        }
      }).catch((error) => {
        Logger.warn(`Unable to retrieve audit logs for guild: ${msg.channel.guild.name}`, error)
      })
    }
  })
}
