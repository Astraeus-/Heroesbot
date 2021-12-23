import cron from 'node-cron';

import HeroesbotClient from '../src/Client';
import Client from '../src/Client';
import { defaultServer, env, token } from '../src/config';
import { AssignRegion } from './Interactions';

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

const regionTask = cron.schedule('0 0 * * Wed', () => {
  if (env === 'production') {
    AssignRegion.cronSync(client.guilds.get(defaultServer));
  }
}, {
  scheduled: false
});

client.launch().then(() => {
  regionTask.start();
});
