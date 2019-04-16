const regions = [
  {
    name: 'eu',
    timezone: 'Europe/Berlin',
    heroesloungeId: '1',
    hotslogsId: '2'
  },
  {
    name: 'na',
    timezone: 'America/Los_Angeles',
    heroesloungeId: '2',
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
]

const timezone = regions.filter((region) => {
  return region.timezone !== null
})

const heroesloungeId = regions.filter((region) => {
  return region.heroesloungeId !== null
})

const hotslogsId = regions.filter((region) => {
  return region.hotslogsId !== null
})

module.exports = { timezone, heroesloungeId, hotslogsId, regions }
