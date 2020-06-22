
const BaseCommand = require('../Classes/BaseCommand');
const heroesloungeApi = require('../Classes/HeroesLounge');
const { Logger } = require('../util.js');

class CasterStatistics extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['casters_lounge', 'devops'],
        'roles': ['Lounge Master', 'Board', 'Managers'],
        'users': ['87976337234464768', '259429473265516545', '108153813143126016']
      }
    };

    const options = {
      'prefix': '!',
      'command': 'casterstatistics',
      'category': 'casters',
      'aliases': ['caststats', 'casterstats'],
      'description': 'Provides you with the casting statistics between two specified dates.',
      'syntax': 'casterstats <YYYY-MM-DD> <YYYY-MM-DD>',
      'enabled': true,
      'min_args': 2
    };

    super(permissions, options);
  }

  async exec (msg, args) {
    const [startDate, endDate] = args;

    let matches;

    try {
      matches = await heroesloungeApi.getMatchesWithApprovedCastBetween(startDate, endDate);
    } catch (error) {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`);
      }).catch((error) => {
        Logger.warn('Could not notify invalid announcement syntax', error);
      });

      return;
    }    

    const numberOfMatches = Object.keys(matches);
    return msg.channel.createMessage(`There were ${numberOfMatches.length} casted matches between ${startDate} and ${endDate}.`);
  }
}

module.exports = CasterStatistics;
