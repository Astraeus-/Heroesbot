import HeroesbotClient from '../Client';
import { Logger } from '../util';

export default (client: HeroesbotClient) => {
  client.on('disconnect', () => {
    Logger.info('Heroesbot disconnected, reconnecting...');
  });
};
