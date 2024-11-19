const { defaultTo } = require('lodash');

module.exports.PORT = defaultTo(process.env.PORT, 3000);

module.exports.SECRET_KEY = defaultTo(process.env.SECRET_KEY, '');
