
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { Logger } = require('../util.js');

const { defaultServer } = require('../config.js');

class AssignAram extends BaseCommand {
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
      'command': 'assignaram',
      'category': 'admin',
      'aliases': [],
      'description': 'Assigns captains participating in the playoff to the Aram Captains channel',
      'syntax': 'assignaram <playoffID>',
      'min_args': 1,
      'ignoreInHelp': true
    };
    
    super(permissions, options, bot);
  }

  exec (msg, args) {
    const playoffID = args[0];

    return syncAramCaptainLounge(this.bot, playoffID).then((response) => {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Updated Aram Captains Lounge: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`);
      }).catch((error) => {
        Logger.warn('Could not notify about Aram captain syncing', error);
      });
    });
  }
}

const syncAramCaptainLounge = (bot, playoffID) => {
  Logger.info('Synchronising Aram Captains Lounge');

  return getAramTeams(playoffID).then((teams) => {
    teams = [].concat.apply([], teams);
    
    const aramCaptainChannel = bot.guilds.get(defaultServer).channels.find((channel) => {
      return channel.name === 'aram_captains_lounge';
    });

    if (aramCaptainChannel) {
      // Delete all of the existing captains.
      aramCaptainChannel.permissionOverwrites.map(async(permission) => {
        if (permission.type === 'member') {
          await aramCaptainChannel.deletePermission(permission.id);
        }
      });

      let errorMessage = '';
      const syncedCaptains = [];

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
            const member = aramCaptainChannel.guild.members.get(captainSloth.discord_id);

            if (member) {
              syncedCaptains.push(
                aramCaptainChannel.editPermission(captainSloth.discord_id, 1024, 0, 'member').catch((error) => {
                  Logger.warn(`Unable to add captain to aram captain lounge ${team.title} user ${captainSloth.title}`, error);
                  errorMessage += `Unable to add captain to aram captain lounge ${team.title} user ${captainSloth.title}\n`;
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

      return Promise.all(syncedCaptains).then(() => {
        Logger.info(`Aram captains lounge synchronisation complete, added ${syncedCaptains.length} users`);
        return {
          updatedCaptainCounter: syncedCaptains.length,
          errorMessage: errorMessage
        };
      });
    }
  });
};

const getAramTeams = async (playoffID) => {
  const playoffDivisions = await heroesloungeApi.getPlayoffDivisions(playoffID);
  let teams = [];

  for (let division of playoffDivisions) {
    teams.push(heroesloungeApi.getDivisionTeams(division.id));
  }

  return Promise.all(teams);
};

module.exports = AssignAram;
