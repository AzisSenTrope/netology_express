const runServer = require('./server/server');

const PORT = process.env.PORT || 3002
const UrlDB = process.env.UrlDB || 'mongodb://root:example@mongo:27017/';

runServer(PORT, UrlDB);