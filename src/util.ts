import dateformat from 'date-fns/format';
import { env } from './config';

interface Region {
  name: string;
  timezone: string | null;
  heroesloungeId: 1 | 2 | null;
  blizzardRegion: '1' | '2' | '3' | '5';
}

export const Logger = {
  info: (msg: string) => {
    console.log(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}|`, msg);
  },
  warn: (msg: string, warning?: object) => {
    console.warn(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, warning);
  },
  error: (msg: string, error: object) => {
    console.error(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, error);
  },
  debug: (msg: string, error?: object) => {
    if (env === 'debug') {
      console.log(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, error);
    }
  }
};

export const regions : Region[] = [
  {
    name: 'eu',
    timezone: 'Europe/Berlin',
    heroesloungeId: 1,
    blizzardRegion: '2'
  },
  {
    name: 'na',
    timezone: 'America/Los_Angeles',
    heroesloungeId: 2,
    blizzardRegion: '1'
  },
  {
    name: 'kr',
    timezone: null,
    heroesloungeId: null,
    blizzardRegion: '3'
  },
  {
    name: 'cn',
    timezone: null,
    heroesloungeId: null,
    blizzardRegion: '5'
  }
];

export const timezone = regions.filter((region) => {
  return region.timezone !== null;
});

export const heroesloungeId = regions.filter((region) => {
  return region.heroesloungeId !== null;
});

export const blizzardRegion = regions.filter((region) => {
  return region.blizzardRegion !== null;
});
