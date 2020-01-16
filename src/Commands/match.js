
const BaseCommand = require('../Classes/BaseCommand');
const { embedDefault } = require('../config.js');

class Match extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20'],
        'roles': [],
        'users': []
      },
      'HotS - Nexus Brawls': {
        'channels': ['match_lounge_1', 'match_lounge_2'],
        'roles': [],
        'users': []
      },
      'Nexus Schoolhouse': {
        'channels': ['mockdrafts'],
        'roles': [],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'match',
      'category': 'competition',
      'aliases': [],
      'description': 'Determines whether you have map pick or first pick.',
      'syntax': 'match'
    };
    
    super(permissions, options);
  }

  exec (msg) {
    const embed = {
      color: embedDefault.color,
      footer: {
        text: 'If you require further assistance, contact one of our moderators'
      },
      description: ''
    };

    const base = 'The draft order has been randomly determined:\n';
    const map = '```\n' + msg.author.username + ': Map pick \nOpponent: First pick \n```\n' + msg.author.username + ', please ban a map first.';
    const pick = '```\n' + msg.author.username + ': First pick \nOpponent: Map pick \n```\nOpponent, please ban a map first.';

    const output = Math.random() >= 0.5 ? map : pick;

    embed.description += '[Amateur series rules](https://heroeslounge.gg/general/ruleset)\n[Division S rules](https://heroeslounge.gg/divisionS/ruleset)\nAmateur Series teams ban two maps each, as according to their ruleset\n\n';
    embed.description += base + output;

    return msg.channel.createMessage({ embed: embed });
  }
}

module.exports = Match;

