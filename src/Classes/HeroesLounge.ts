import { Client } from 'heroeslounge-api';
import { hlApiKey } from '../config';

class MyClient extends Client {
  constructor(token: string) {
    super(token);
  }
}

export default new MyClient(hlApiKey);
