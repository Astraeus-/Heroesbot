import Eris from 'eris';
import BaseInteraction from './Classes/BaseInteraction';
import { defaultServer } from './config';

import * as Events from './Events';
import * as Interactions from './Interactions';
import { Logger } from './util';

export default class HeroesbotClient extends Eris.Client {
  startingUp = true;
  globalInteractionCommands: Map<string, BaseInteraction>
  guildInteractionCommands: Map<string, BaseInteraction>

  constructor(token: string, options: Eris.ClientOptions) {
    super(token, options);

    this.globalInteractionCommands = new Map();
    this.guildInteractionCommands = new Map();
  }

  async launch() {
    await this.loadEvents();
    return this.connect();
  }

  async loadInteractions() {
    this.globalInteractionCommands.clear();
    this.guildInteractionCommands.clear();

    const interactions = Object.values(Interactions);
    for (const interaction of interactions) {
      const initiatedInteraction = new interaction();
      if (initiatedInteraction.global) {
        this.globalInteractionCommands.set(initiatedInteraction.name.toLowerCase(), initiatedInteraction);
      } else {
        this.guildInteractionCommands.set(initiatedInteraction.name.toLowerCase(), initiatedInteraction);
      }
    }

    const guildInteractionsArray : Eris.ApplicationCommandStructure[] = Array.from(this.guildInteractionCommands.values());
    const globalInteractionsArray : Eris.ApplicationCommandStructure[] = Array.from(this.globalInteractionCommands.values());

    Logger.info(`Loaded ${globalInteractionsArray.length + guildInteractionsArray.length} commands`);

    const guildCommands = await this.bulkEditGuildCommands(defaultServer, guildInteractionsArray);
    await this.bulkEditCommands(globalInteractionsArray);

    // Heroes Lounge Guild
    if (defaultServer === '200267155479068672') {
      for (const command of guildCommands) {
        const matchingInteraction = this.guildInteractionCommands.get(command.name);
        
        if (matchingInteraction && matchingInteraction.permissions.length > 0) {
          await this.editCommandPermissions(defaultServer, command.id, matchingInteraction.permissions);
        }
      }
    }
  }

  async loadEvents() {
    this.removeAllListeners();

    const eventCallbacks = Object.values(Events);
    for (const event of eventCallbacks) {
      event(this);
    }

    Logger.info(`Loaded ${eventCallbacks.length} events`);
  }
}
