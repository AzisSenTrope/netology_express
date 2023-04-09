const express = require('express')
const bookRouter = require('../routes/books');
const mainRouter = require('../routes/main');
const ENDPOINTS = require('../endpoints/endpoints');
const {dirname} = require('../../config');

const path = require('path');


function runServer(port) {
    const app = express();
    app.use(express.json());
    app.set('views', path.join(dirname, 'src/views'));
    app.set("view engine", "ejs");
    app.use(ENDPOINTS.API, bookRouter);
    app.use(mainRouter);

    app.listen(port)
}

module.exports = runServer;