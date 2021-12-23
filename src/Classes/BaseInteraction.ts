import Eris, {CommandInteraction, Constants, Interaction} from 'eris';

export default abstract class BaseInteraction {
    name: string;
    description: string;
    options: Eris.ApplicationCommandOptions[];
    type: (Constants['ApplicationCommandTypes'])[keyof Constants['ApplicationCommandTypes']];
    defaultPermission: boolean;

    protected constructor(
      name: string, description: string,
      options: Eris.ApplicationCommandOptions[],
      type: (Constants['ApplicationCommandTypes'])[keyof Constants['ApplicationCommandTypes']],
      defaultPermission?: boolean
    ) {
      this.name = name;
      this.description = description;
      this.options = options;
      this.type = type;
      this.defaultPermission = defaultPermission ?? true;
    }

    abstract execute(interaction: Interaction): void;

    protected getNumberValueFromCommandInteraction(name: string, interaction: CommandInteraction): number | null {
      const options = interaction.data.options;
      if (!options) return null;

      const option = options.find(o => o.name === name);
      if (!option || option.type !== Eris.Constants.ApplicationCommandOptionTypes.NUMBER) return null;

      return option.value;
    }

    protected getStringValueFromCommandInteraction(name: string, interaction: CommandInteraction): string | null {
      const options = interaction.data.options;
      if (!options) return null;

      const option = options.find(o => o.name === name);
      if (!option || option.type !== Eris.Constants.ApplicationCommandOptionTypes.STRING) return null;

      return option.value;
    }
}