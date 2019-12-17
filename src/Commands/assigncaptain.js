
const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

const heroesloungeApi = require('heroeslounge-api');
const { defaultServer } = require('../config.js');

class AssignCaptain extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': ['108153813143126016']
      }
    };

    const options = {
      'prefix': '!',
      'command': 'assigncaptain',
      'category': 'admin',
      'aliases': [],
      'description': 'Assigns the Captain role to all the captains of participating teams.',
      'syntax': 'assigncaptain',
      'ignoreInHelp': true
    };
    
    super(permissions, options, bot);
  }

  exec (msg) {
    return syncCaptains(this.bot).then((response) => {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Updated captains: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`);
      }).catch((error) => {
        Logger.warn('Could not notify about captain syncing', error);
      });
    });
  }
}

const syncCaptains = (bot) => {
  Logger.info('Synchronising captain roles');

  return getParticipatingTeams().then((teams) => {
    let errorMessage = '';
    const syncedSloths = [];

    const guild = bot.guilds.get(defaultServer);
    const captainRole = guild.roles.find((role) => {
      return role.name === 'Captains';
    });

    for (const team of teams) {
      if (team.sloths && team.sloths.length > 0 && team.disbanded === 0) {
        let captainSloth;

        for (const sloth of team.sloths) {
          if (sloth.pivot.is_captain === 1) {
            captainSloth = sloth;
            break;
          }
        }

        if (!captainSloth) {
          errorMessage += `No captain for ${team.title}\n`;
          continue;
        }

        if (captainSloth.discord_id.length > 0) {
          const member = guild.members.get(captainSloth.discord_id);

          if (member) {
            if (member.roles.includes(captainRole.id)) continue;

            syncedSloths.push(
              guild.addMemberRole(captainSloth.discord_id, captainRole.id).catch((error) => {
                Logger.warn(`Unable to assign captain for team ${team.title} user ${captainSloth.title}`, error);
                errorMessage += `Unable to assign captain for team ${team.title} user ${captainSloth.title}\n`;
              })
            );
          } else {
            errorMessage += `Captain not on discord for ${team.title} member ${captainSloth.title}\n`;
          }
        } else {
          errorMessage += `No discord id for ${team.sloths[0].title} from ${team.title}\n`;
        }
      } else {
        errorMessage += `No sloths for ${team.title}\n`;
      }
    }

    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Captain role synchronisation complete, updated ${syncedSloths.length} users`);
      return {
        updatedCaptainCounter: syncedSloths.length,
        errorMessage: errorMessage
      };
    });
  }).catch((error) => {
    throw error;
  });
};

const getParticipatingTeams = async () => {
  const seasons = await heroesloungeApi.getSeasons().catch((error) => {
    throw error;
  });

  let teamsByRegion = [];
  let seasonCounter = 0;

  for (let i = seasons.length - 1; i >= 0; i--) {
    if (seasonCounter >= 2) break;
    if (seasons[i].type === 2) continue; // Ignore Division S seasons

    if (seasons[i].is_active === 1 && seasons[i].reg_open === 0) {
      teamsByRegion = [...teamsByRegion, heroesloungeApi.getSeasonTeams(seasons[i].id)];
      seasonCounter++;
    } else if (seasons[i].is_active === 1 && seasons[i].reg_open === 1) {
      seasonCounter++;
    }
  }

  return Promise.all(teamsByRegion).then((regionTeams) => {
    let teams = [];
    for (let i = 0; i < regionTeams.length; i++) {
      teams = [...teams, ...regionTeams[i]];
    }

    return teams;
  });
};

module.exports = AssignCaptain;
