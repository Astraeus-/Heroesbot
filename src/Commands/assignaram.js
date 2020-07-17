
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
      'description': 'Assigns captains participating in the playoff to the mentioned channel',
      'syntax': 'assignaram <playoffID> <#channel>',
      'min_args': 2,
      'ignoreInHelp': true
    };
    
    super(permissions, options, bot);
  }

  exec (msg, args) {
    const playoffID = args[0];
    const syncChannel = this.bot.guilds.get(defaultServer).channels.get(msg.channelMentions[0]);

    if (!syncChannel) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Invalid channel specified: ${args[1]}`);
      });
    }

    if (!this.bot.guilds.get(defaultServer).members.get(this.bot.user.id).permission.has('manageChannels') && !syncChannel.permissionsOf(this.bot.user.id).has('manageRoles')) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage('Unable to update captains.\nHeroesbot missing permission: manageChannels');
      }); 
    }

    return syncAramCaptainLounge(playoffID, syncChannel).then((response) => {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Updated ${syncChannel.name}: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`);
      }).catch((error) => {
        Logger.warn(`Could not notify ${syncChannel.name} captain syncing`, error);
      });
    });
  }
}

const syncAramCaptainLounge = (playoffID, syncChannel) => {
  Logger.info('Synchronising Aram Captains Lounge');

  return getAramTeams(playoffID).then((teams) => {
    teams = [].concat.apply([], teams);

    let errorMessage = '';
    const syncedCaptains = [];

    // Delete all of the existing captains.
    syncChannel.permissionOverwrites.map(async(permission) => {
      if (permission.type === 'member') {
        await syncChannel.deletePermission(permission.id);
      }
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
          const member = syncChannel.guild.members.get(captainSloth.discord_id);

          if (member) {
            syncedCaptains.push(
              syncChannel.editPermission(captainSloth.discord_id, 1024, 0, 'member').catch((error) => {
                Logger.warn(`Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth.title}`, error);
                errorMessage += `Unable to add captain to ${syncChannel.name} ${team.title} user ${captainSloth.title}\n`;
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
      Logger.info(`${syncChannel.name} captain synchronisation complete, added ${syncedCaptains.length} users`);
      return {
        updatedCaptainCounter: syncedCaptains.length,
        errorMessage: errorMessage
      };
    });
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
