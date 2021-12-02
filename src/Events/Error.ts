import HeroesbotClient from '../Client';
import { Logger } from '../util';

export default (client: HeroesbotClient) => {
  client.on('error', (error, id) => {
    if (error.message !== 'Connection reset by peer') {
      Logger.error(`Encountered an error on shard ${id}`, error);
    }
  });
};
