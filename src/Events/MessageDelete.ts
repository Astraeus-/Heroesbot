import { defaultServer, webhooks } from '../config';
import { Logger } from '../util';
import HeroesbotClient from '../Client';
import Eris, { GuildChannel, Message } from 'eris';

export default (client: HeroesbotClient) => {
  client.on('messageDelete', async (message: Message) => {
    if (!(message.channel instanceof GuildChannel) || message.guildID !== defaultServer) {
      return;
    }

    try {
      const auditLog = await message.channel.guild.getAuditLog({limit: 1, actionType: 72});
      const entry = auditLog.entries[0];

      if (!entry) {
        return;
      }

      // Checks that the last entry is deleting from the same user that deleted this message
      if (message.author?.id === entry.targetID) {
        const webhookResponse = {
          title: 'Message Delete',
          color: 16711680,
          description: `Deleted by: ${entry.user.username}\nChannel: ${entry.channel?.name}`,
          type: 'rich',
        };

        const embeds: Eris.Embed[] = [webhookResponse];

        if (message.content.length > 0) {
          embeds.push({
            title: 'Message',
            color: 16711680,
            description: message.cleanContent,
            type: 'rich',
            footer: {
              icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
              text: `${message.author.username}#${message.author.discriminator}`
            }
          });
        }

        if (message.attachments.length > 0) {
          for (const attachment of message.attachments) {
            embeds.push({
              title: 'Attachment',
              color: 16711680,
              description: `Name: ${attachment.filename}\nURL: ${attachment.proxy_url}`,
              type: 'rich',
            });
          }
        }
          
        await client.executeWebhook(webhooks.moderatorLogs.id, webhooks.moderatorLogs.token, {
          embeds,
        });
      }
    } catch (error: any) {
      Logger.warn(`Unable to retrieve audit logs for guild: ${message.channel.guild.name}`, error);
    }
  });
};
