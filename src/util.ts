import { env } from './config';
import { Region } from './types';

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: 'numeric',
  second: 'numeric',
});

export const Logger = {
  info: (msg: string) => {
    console.log(`${formatter.format(Date.now())}|`, msg);
  },
  warn: (msg: string, warning?: object) => {
    console.warn(`${formatter.format(Date.now())}| ${msg}\n`, warning);
  },
  error: (msg: string, error: object) => {
    console.error(`${formatter.format(Date.now())}| ${msg}\n`, error);
  },
  debug: (msg: string, error?: object) => {
    if (env === 'debug') {
      console.log(`${formatter.format(Date.now())}| ${msg}\n`, error);
    }
  }
};

export const regions: Region[] = [
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
