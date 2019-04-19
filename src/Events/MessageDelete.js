const { defaultServer, webhooks } = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.moderatorLogs.id, webhooks.moderatorLogs.token)
const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('messageDelete', (msg) => {
    let deletedMessage = msg.cleanContent ? msg.cleanContent : 'Uncached message'

    if (msg.channel.guild && msg.channel.guild.id === defaultServer) {
      msg.channel.guild.getAuditLogs(1, null, 72).then((auditlogs) => {
        const invoker = auditlogs.entries[0].user.username
        webhook.send({
          title: 'Message Deleted',
          color: 16711680,
          description: `${invoker} deleted:\n${deletedMessage}`
        })
      }).catch((error) => {
        Logger.warn(`Unable to retrieve audit logs for guild: ${msg.channel.guild.name}`, error)
      })
    }
  })
}
