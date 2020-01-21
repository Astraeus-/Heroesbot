const {hlApiKey} = require('../config.js');

const heroesloungeApi = require('heroeslounge-api');
module.exports = new heroesloungeApi(hlApiKey);
