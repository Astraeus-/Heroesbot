require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  token: process.env.TOKEN,
  defaultServer: process.env.DEFAULT_SERVER,
  hpApiKey: process.env.HEROES_PROFILE_API_KEY,
  memeCooldown: process.env.REACTION_RESPONSE_COOLDOWN,
  embed: {
    color: 5759467,
    footer: {
      icon_url: 'https://cdn.discordapp.com/avatars/108153813143126016/a17e2feaf381e367aee83f2fae000669.png',
      text: 'Developed by: Astraeus | PM for ideas and suggestions'
    }
  },
  webhooks: {
    commandLogs: {
      id: process.env.COMMAND_LOG_WEBHOOK_ID,
      token: process.env.COMMAND_LOG_WEBHOOK_TOKEN
    },
    moderatorLogs: {
      id: process.env.MODERATOR_LOG_WEBHOOK_ID,
      token: process.env.MODERATOR_LOG_WEBHOOK_TOKEN
    }
  },
  vip: {
    '321640682840391680': {
      Name: 'Test-Server',
      roleID: '353991504672456716',
      rewardRoles: [
        'Patreon VIP',
        'Twitch Subscriber',
        'Honorary VIP'
      ]
    },
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
