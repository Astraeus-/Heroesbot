const dateformat = require('date-fns/format');
const {env} = require('./config.js');

const Logger = {
  info: (msg) => {
    console.log(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}|`, msg);
  },
  warn: (msg, warning) => {
    console.warn(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, warning);
  },
  error: (msg, error) => {
    console.error(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, error);
  },
  debug: (msg, error) => {
    if (env === 'debug') {
      console.log(`${dateformat(Date.now(), 'dd/MM/yyyy hh:mm:ss a')}| ${msg}\n`, error);
    }
  }
};

const regions = [
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

const timezone = regions.filter((region) => {
  return region.timezone !== null;
});

const heroesloungeId = regions.filter((region) => {
  return region.heroesloungeId !== null;
});

const blizzardRegion = regions.filter((region) => {
  return region.blizzardRegion !== null;
});

module.exports = { Logger, timezone, heroesloungeId, blizzardRegion, regions };
