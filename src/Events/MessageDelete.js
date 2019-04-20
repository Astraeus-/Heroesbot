const { defaultServer, webhooks } = require('../config.json')
const WebhookClient = require('../Classes/WebhookClient.js')
const webhook = new WebhookClient(webhooks.moderatorLogs.id, webhooks.moderatorLogs.token)
const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('messageDelete', (msg) => {
    if (msg.channel.guild && msg.channel.guild.id === defaultServer) {
      msg.channel.guild.getAuditLogs(1, null, 72).then((auditlogs) => {
        const invoker = msg.channel.guild.members.get(auditlogs.entries[0].user.id)

        if (msg.cleanContent && invoker.permission.has('manageMessages') && msg.author && msg.author.id !== invoker.id) {
          webhook.send({
            title: 'Message Deleted',
            color: 16711680,
            description: `${invoker.username} deleted:\n${msg.cleanContent}`
          })
        }
      }).catch((error) => {
        Logger.warn(`Unable to retrieve audit logs for guild: ${msg.channel.guild.name}`, error)
      })
    }
  })
}
