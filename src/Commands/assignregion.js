
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { Logger, regions } = require('../util.js');

const { defaultServer } = require('../config.js');

class AssignRegion extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['devops'],
        'roles': ['Lounge Master', 'Board', 'Managers'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'assignregion',
      'category': 'admin',
      'aliases': [],
      'description': 'Assigns the EU or NA region to all the registered website users.',
      'syntax': 'assignregion',
      'ignoreInHelp': true
    };
    
    super(permissions, options, bot);
  }

  exec (msg) {
    return syncRegionRoles(this.bot).then(() => {
      if (msg) {
        return msg.addReaction('✅').catch((error) => {
          Logger.warn('Could not notify region syncing', error);
        });
      }
    });
  }
}

const syncRegionRoles = async (bot) => {
  Logger.info('Synchronising region roles');
  return heroesloungeApi.getSloths().then((sloths) => {
    const guild = bot.guilds.get(defaultServer);
    const regionIds = {};
    const regionDiscordRoleIds = {};

    for (const region of regions) {
      if (region.heroesloungeId) {
        regionIds[region.name] = region.heroesloungeId;
        const regionRole = guild.roles.find((role) => {
          return role.name.toLowerCase() === region.name;
        });

        if (regionRole) {
          regionDiscordRoleIds[region.name] = regionRole.id;
        }
      }
    }

    const syncedSloths = [];

    for (const sloth in sloths) {
      const currentSloth = sloths[sloth];
      if (currentSloth.discord_id.length === 0) continue;
      if (currentSloth.discord_id === '221678731888951296') continue; // Ignore update spam from Schwifty

      const member = guild.members.get(currentSloth.discord_id);
      if (!member) continue;

      const roles = member.roles;
      let regionRoleId;
      if (currentSloth.region_id === 1) {
        regionRoleId = regionDiscordRoleIds['eu'];
      } else if (currentSloth.region_id === 2) {
        regionRoleId = regionDiscordRoleIds['na'];
      } else {
        continue;
      }

      if (roles.includes(regionRoleId)) continue;

      if (currentSloth.region_id === regionIds['eu'] && roles.includes(regionDiscordRoleIds['na'])) {
        guild.removeMemberRole(currentSloth.discord_id, regionDiscordRoleIds['na']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      if (currentSloth.region_id === regionIds['na'] && roles.includes(regionDiscordRoleIds['eu'])) {
        guild.removeMemberRole(currentSloth.discord_id, regionDiscordRoleIds['eu']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      syncedSloths.push(
        guild.addMemberRole(currentSloth.discord_id, regionRoleId).catch((error) => {
          Logger.error(`Error assigning region role to ${currentSloth.discord_tag}`, error);
        })
      );
    }

    return syncedSloths;
  }).then((syncedSloths) => {
    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Region role synchronisation complete, updated ${syncedSloths.length} ${syncedSloths.length === 0 || syncedSloths.length > 1 ? 'users' : 'user'}`);
      return 'Region role synchronisation complete';
    });
  }).catch((error) => {
    Logger.error('Error syncing all region roles', error);
  });
};

module.exports = AssignRegion;
