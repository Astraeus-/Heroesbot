import HeroesbotClient from '../src/Client';
import Client from '../src/Client';
import { token } from '../src/config';

const client: HeroesbotClient = new Client(token, {
  getAllUsers: true,
  allowedMentions: {
    everyone: true,
    roles: true,
    users: true
  },
  intents: [
    'guilds',
    'guildMembers',
    'guildBans',
    'guildEmojis',
    'guildIntegrations',
    'guildWebhooks',
    'guildPresences',
    'guildMessages',
    'guildMessageReactions',
    'directMessages',
    'directMessageReactions'
  ]
});

// const regionTask = cron.schedule('0 0 * * Wed', () => {
//   if (env === 'production') {
//     HeroesbotClient.interactionCommands.get('assignregion').exec();
//   }
// }, {
//   scheduled: false
// });

client.launch().then(() => {
  // regionTask.start();
});
