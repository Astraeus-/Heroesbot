const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const heroesloungeApi = require('heroeslounge-api');

const { defaultServer } = require('../config.js');
const { regions } = require('../util.js');

class AssignRegion extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016']
      }
    };

    const options = {
      prefix: '!',
      command: 'assignregion',
      aliases: [],
      description: 'Assigns the EU or NA region to all the registered website users.',
      syntax: 'assignregion',
      ignoreInHelp: true
    };

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg) {
    syncRegionRoles(this.bot).then((response) => {
      if (msg) {
        return msg.addReaction('✅').catch((error) => {
          Logger.warn('Could not notify region syncing', error);
        });
      }
    }).catch((error) => {
      Logger.error('Unable to sync region roles', error);
    });
  }
}

const syncRegionRoles = async (bot) => {
  Logger.info('Synchronising region roles');
  return heroesloungeApi.getSloths().then((sloths) => {
    const regionIds = {};
    const regionDiscordRoleIds = {};

    for (const region of regions) {
      if (region.heroesloungeId) {
        regionIds[region.name] = region.heroesloungeId;
        const regionRole = bot.guilds.get(defaultServer).roles.find((role) => {
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

      const member = bot.guilds.get(defaultServer).members.get(currentSloth.discord_id);
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
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionDiscordRoleIds['na']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      if (currentSloth.region_id === regionIds['na'] && roles.includes(regionDiscordRoleIds['eu'])) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionDiscordRoleIds['eu']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error);
        });
      }

      syncedSloths.push(
        bot.addGuildMemberRole(defaultServer, currentSloth.discord_id, regionRoleId).catch((error) => {
          Logger.error(`Error assigning region role to ${currentSloth.discord_tag}`, error);
        })
      );
    }

    return syncedSloths;
  }).then((syncedSloths) => {
    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Region role synchronisation complete, updated ${syncedSloths.length} users`);
      return 'Region role synchronisation complete';
    });
  }).catch((error) => {
    Logger.error('Error syncing all region roles', error);
  });
};

module.exports = AssignRegion;
