const runServer = require('./server/server');

const PORT = process.env.PORT || 3002

runServer(PORT);