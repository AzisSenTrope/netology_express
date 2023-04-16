const express = require('express')
const bookRouter = require('../routes/books');
const ENDPOINTS = require('../endpoints/endpoints');
const {TEST_RESPONSE, Book, STORE, initBooks} = require('../utils/utils');
const {connect} = require('mongoose')

async function runServer(port, urlDB) {
    try {
        await connect(urlDB);
        await initBooks();
        const app = express();
        app.use(express.json());
        app.use(ENDPOINTS.API, bookRouter);

        app.listen(port)
        console.log('Сервер запущег')
    } catch (err) {
        console.log('Не удалось запустить сервер ', err);
    }
}

module.exports = runServer;