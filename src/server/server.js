const express = require('express')
const bookRouter = require('../routes/books');
const ENDPOINTS = require('../endpoints/endpoints');

function runServer(port) {
    const app = express();
    app.use(express.json());
    app.use(ENDPOINTS.API, bookRouter);

    app.listen(port)
}

module.exports = runServer;