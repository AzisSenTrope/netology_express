const runServer = require('./server/server');

const PORT = process.env.PORT || 3002
const urlDB = process.env.URL_DB || 'mongodb://root:example@mongo:27017/';

runServer(PORT, urlDB);