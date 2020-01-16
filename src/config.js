require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  token: process.env.TOKEN,
  defaultServer: process.env.DEFAULT_SERVER,
  hpApiKey: process.env.HEROES_PROFILE_API_KEY,
  hlApiKey: process.env.HEROES_LOUNGE_API_KEY,
  memeCooldown: process.env.REACTION_RESPONSE_COOLDOWN,
  embedDefault: {
    color: 5759467
  },
  webhooks: {
    moderatorLogs: {
      id: process.env.MODERATOR_LOG_WEBHOOK_ID,
      token: process.env.MODERATOR_LOG_WEBHOOK_TOKEN
    }
  },
  vip: {
    '200267155479068672': {
      Name: 'Heroes Lounge',
      roleID: '225240536712216577',
      rewardRoles: [
        'Patreon Superhero',
        'Patreon VIP',
        'Twitch Subscriber',
        'Honorary Sloth'
      ]
    }
  }
};
