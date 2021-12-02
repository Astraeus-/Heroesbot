import Eris from 'eris';
import BaseInteraction from './Classes/BaseInteraction';
import { defaultServer } from './config';

import * as Events from './Events';
import * as Interactions from './Interactions';
import { Logger } from './util';

export default class HeroesbotClient extends Eris.Client {
  interactionCommands: Map<string, BaseInteraction>

  constructor(token: string, options: Eris.ClientOptions) {
    super(token, options);

    this.interactionCommands = new Map();
  }

  async launch() {
    await this.loadEvents();
    return this.connect();
  }

  async loadInteractions() {
    this.interactionCommands.clear();

    const interactions = Object.values(Interactions);
    for (const interaction of interactions) {
      const initiatedInteraction = new interaction();
      this.interactionCommands.set(initiatedInteraction.name.toLowerCase(), initiatedInteraction);
    }

    const interactionsArray : Eris.ApplicationCommandStructure[] = Array.from(this.interactionCommands.values());
    Logger.info(`Loaded ${interactionsArray.length} commands`);
    
    return this.bulkEditGuildCommands(defaultServer, interactionsArray);
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
