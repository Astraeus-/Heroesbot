const BaseCommand = require('../Classes/BaseCommand.js');

class Match extends BaseCommand {
  constructor (bot) {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
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
