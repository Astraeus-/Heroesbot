import HeroesbotClient from '../Client';
import { Logger } from '../util';

export default (client: HeroesbotClient) => {
  client.on('ready', async () => {    
    Logger.info('Heroesbot connected');

    if (client.startingUp) {
      await client.loadInteractions();
      client.startingUp = false;
    }
  });
};
