const express = require('express')
const router = express.Router()
const fileMulter = require('../middleware/file')

const ENDPOINTS = require('../endpoints/endpoints');
const {TEST_RESPONSE, Book, STORE} = require('../utils/utils');
const {dirname} = require('../../config');
const {STATUSES} = require('../utils/const');
const deleteFile = require('../utils/delete-file');

router.get(ENDPOINTS.BOOK_DOWNLOAD, (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const book = books.find(el => el.id === id);

    if (!book) {
        res.status(STATUSES.NOT_FOUND);
        res.json('404 | страница не найдена');
        return;
    }

    try {
        res.sendFile(dirname +  '/' + book.fileBook);
    } catch (error) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(error);
    }

})

router.post(ENDPOINTS.LOGIN, (req, res) => {
    res.json(TEST_RESPONSE);
})

router.get(ENDPOINTS.BOOKS, (req, res) => {
    const {books} = STORE;
    res.json(books);
})

router.get(ENDPOINTS.BOOK_ID, (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);

    if( idx !== -1) {
        res.json(books[idx]);
        return;
    }

    res.status(STATUSES.NOT_FOUND);
    res.json('404 | страница не найдена');

})

router.post(ENDPOINTS.BOOKS, fileMulter.single('fileBook'), (req, res) => {
    const {books} = STORE;
    const {file} = req

    if (file) {
        const fileBook = file.path

        const newBook = new Book({...req.body, fileBook});
        books.push(newBook);

        res.status(STATUSES.CREATED);
        res.json(newBook);
        return;
    }

    res.status(STATUSES.INVALID);
    res.send({error: 'Invalid data'});
})

router.put(ENDPOINTS.BOOK_ID, fileMulter.single('fileBook'), (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1){
        const {file} = req;
        if (file) {
            try {
                deleteFile(dirname + '/' + books[idx].fileBook);
            } catch (err) {
                res.status(STATUSES.SERVER_ERROR);
                res.json(err);
                return;
            }
        }

        const fileBook = file.path;
        books[idx] = {
            ...books[idx],
            ...req.body,
            fileBook,
        }

        res.json(books[idx]);
        return;
    }

    res.status(STATUSES.NOT_FOUND);
    res.json('404 | страница не найдена');
})

router.delete(ENDPOINTS.BOOK_ID, (req, res) => {
    const {books} = STORE
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)

    if (idx !== -1){
        if (books[idx].fileBook) {
            try {
                deleteFile(dirname + '/' + books[idx].fileBook);
            } catch (err) {
                res.status(STATUSES.SERVER_ERROR);
                res.json(err);
                return;
            }
        }

        books.splice(idx, 1)
        res.json(true)
        return;
    }

    res.status(STATUSES.NOT_FOUND)
    res.json('404 | страница не найдена')
})

module.exports = router;