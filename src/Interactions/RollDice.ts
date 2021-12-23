import Eris, { Constants } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';

export default class RollDice extends BaseInteraction {
  constructor() {
    const name = 'Roll';
    const description = 'Rolls dice';
    const global = true;
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'dice',
        description: 'Number of dice to throw',
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
        required: false,
      },
      {
        name: 'faces',
        description: 'Number of faces on each die',
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
        required: false,
      }
    ];

    const permissions = new Array<Eris.ApplicationCommandPermissions>();

    super(name, description, options, type, permissions, global);
  }

  execute (interaction: Eris.CommandInteraction) {
    const nDice = this.getNumberValueFromCommandInteraction('dice', interaction) ?? 1;
    const nFaces = this.getNumberValueFromCommandInteraction('faces', interaction) ?? 6;

    const roll = this.rollDice(nDice, nFaces);
    const total = roll.reduce((sum, num) => {
      return sum + num;
    });

    let output = '```' + 'Dice results: ' + roll + '\n\n' + 'Total: ' + total + '```';
    if (output.length > 1000) {
      output = '```Total: ' + total + '```';
    }

    return interaction.createMessage(output);        
  }

  rollDice(nDice: number, nFaces: number) {
    const outcomes: number[] = [];

    for (let i = 0; i < nDice; i++) {
      const roll = Math.floor((Math.random() * nFaces) + 1);
      outcomes.push(roll);
    }
        
    return outcomes;
  }
}
