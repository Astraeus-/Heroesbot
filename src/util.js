const dateformat = require('date-fns/format');

const Logger = {
  info: (msg) => {
    console.log(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}|`, msg);
  },
  warn: (msg, warning) => {
    console.warn(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}| ${msg}`, warning);
  },
  error: (msg, error) => {
    console.error(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}| ${msg}`, error);
  }
};

const regions = [
  {
    name: 'eu',
    timezone: 'Europe/Berlin',
    heroesloungeId: 1,
    hotslogsId: '2'
  },
  {
    name: 'na',
    timezone: 'America/Los_Angeles',
    heroesloungeId: 2,
    hotslogsId: '1'
  },
  {
    name: 'kr',
    timezone: null,
    heroesloungeId: null,
    hotslogsId: '3'
  },
  {
    name: 'cn',
    timezone: null,
    heroesloungeId: null,
    hotslogsId: '5'
  }
];

const timezone = regions.filter((region) => {
  return region.timezone !== null;
});

const heroesloungeId = regions.filter((region) => {
  return region.heroesloungeId !== null;
});

const hotslogsId = regions.filter((region) => {
  return region.hotslogsId !== null;
});

module.exports = { Logger, timezone, heroesloungeId, hotslogsId, regions };
