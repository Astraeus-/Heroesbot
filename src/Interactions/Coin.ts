import Eris from 'eris';
import fs from 'fs/promises';
import path from 'path';

import BaseInteraction from '../Classes/BaseInteraction';

export default class Coin extends BaseInteraction {
  constructor() {
    const name = 'Coin';
    const description = 'Flips a coin';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type);
  }

  async execute (interaction: Eris.CommandInteraction) {
    const output = Math.random() >= 0.5 ? 'heads' : 'tails';
    const imageFile = await fs.readFile(path.join(__dirname, `../Data/Images/${output}.png`));

    interaction.createMessage('', {
      file: imageFile,
      name: `${output}.png`,
    });
  }
}
