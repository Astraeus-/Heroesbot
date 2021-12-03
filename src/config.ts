import { config } from 'dotenv';
config();

interface VIP {
  name: string;
  roleID: string;
  rewardRoles: string[];
}

export const env = process.env.NODE_ENV ?? 'development';
export const token = process.env.TOKEN ?? 'invalid-token';
export const defaultServer = process.env.DEFAULT_SERVER ?? 'invalid-server';
export const hpApiKey = process.env.HEROES_PROFILE_API_KEY;
export const hlApiKey = process.env.HEROES_LOUNGE_API_KEY ?? 'invalid-hl-key';
export const memeCooldown = process.env.REACTION_RESPONSE_COOLDOWN;
export const embedDefault = {
  color: 5759467
};

export const webhooks = {
  moderatorLogs: {
    id: process.env.MODERATOR_LOG_WEBHOOK_ID ?? 'invalid-id',
    token: process.env.MODERATOR_LOG_WEBHOOK_TOKEN ?? 'invalid-token',
  },
};

export const vip: Record<string, VIP> = {
  '200267155479068672': {
    name: 'Heroes Lounge',
    roleID: '225240536712216577',
    rewardRoles: [
      'Patreon Superhero',
      'Patreon VIP',
      'Twitch Subscriber',
      'Honorary Sloth',
    ],
  },
};
