
const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

const MatchesTodayCacheManager = require('../Caches/MatchesToday.js');
const TeamsCacheManager = require('../Caches/Teams.js');

class UpdateCache extends BaseCommand {
  constructor () {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': ['108153813143126016']
      }
    };

    const options = {
      'prefix': '!',
      'command': 'updatecache',
      'category': 'admin',
      'description': 'Updates the specified cache.',
      'syntax': 'updatecache <option>\nOptions are: teams, matches, all',
      'ignoreInHelp': true,
      'min_args': 1
    };

    super(permissions, options);
  }

  exec (msg, args) {
    const type = args[0];
    const cacheData = [];

    switch (type) {
    case 'teams':
      cacheData.push(TeamsCacheManager.updateCache());
      break;

    case 'matches':
      cacheData.push(MatchesTodayCacheManager.updateCache('eu'));
      cacheData.push(MatchesTodayCacheManager.updateCache('na'));
      break;

    case 'all':
      cacheData.push(MatchesTodayCacheManager.updateCache('eu'));
      cacheData.push(MatchesTodayCacheManager.updateCache('na'));
      cacheData.push(TeamsCacheManager.updateCache());
      break;

    default:
    }

    if (cacheData.length === 0) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`);
      });
    }

    Promise.all(cacheData).then(() => {
      return msg.addReaction('✅').catch((error) => {
        Logger.warn(`Could not notify about updating ${type} cache`, error);
      });
    }).catch((error) => {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Could not update ${type} cache \n\`\`\`js\n${error}\n\`\`\``);
      }).catch((error) => {
        Logger.warn(`Could not notify about failing to update ${type} cache`, error);
      });
    });
  }
}

module.exports = UpdateCache;

