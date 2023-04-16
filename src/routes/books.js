const express = require('express')
const router = express.Router()
const fileMulter = require('../middleware/file')

const ENDPOINTS = require('../endpoints/endpoints');
const {TEST_RESPONSE} = require('../utils/utils');
const {dirname} = require('../../config');
const {STATUSES} = require('../utils/const');
const deleteFile = require('../utils/delete-file');
const Book = require('../model/bookModel');

router.get(ENDPOINTS.BOOK_DOWNLOAD, async (req, res) => {
    const {id} = req.params;
    try {
        const book = await Book.findById(id).select('-__v');

        if (!book) {
            res.status(STATUSES.NOT_FOUND);
            res.json('404 | страница не найдена');
            return;
        }

        res.download(dirname +  '/' + book.fileBook, book.fileName);
    } catch (err) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(err);
    }
})

router.post(ENDPOINTS.LOGIN, (req, res) => {
    res.json(TEST_RESPONSE);
})

router.get(ENDPOINTS.BOOKS, async (req, res) => {
    try {
        const books = await Book.find().select('-__v')
        res.json(books);
    } catch (err) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(err);
    }

})

router.get(ENDPOINTS.BOOK_ID, async (req, res) => {
    const {id} = req.params;

    try {
        const book = await Book.findById(id).select('-__v');
        res.json(book);
    } catch (err) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(err);
    }
})

router.post(ENDPOINTS.BOOKS, fileMulter.single('fileBook'), async (req, res) => {
    const {file} = req

    if (file) {
        const fileBook = file.path;
        const newBook = new Book({...req.body, fileBook});

        try {
            await newBook.save();
            res.status(STATUSES.CREATED);
            res.json(newBook)
        } catch (err) {
            res.status(STATUSES.SERVER_ERROR);
            res.json(err);
        }
    }
})

router.put(ENDPOINTS.BOOK_ID, fileMulter.single('fileBook'), async (req, res) => {
    const {id} = req.params;

    try {
        const book = await Book.findById(id).select('-__v');
        if (book) {
            const {file} = req;
            if (file) {
                deleteFile(dirname + '/' + book.fileBook);
                const fileBook = file.path;
                const fileName = file.originalname;
                await Book.findByIdAndUpdate(id, {
                    ...req.body,
                    fileName,
                    fileBook,
                });
            } else {
                await Book.findByIdAndUpdate(id, {
                    ...req.body,
                });
            }

            res.redirect(`/api/books/${id}`);
        }
    } catch (err) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(err);
    }
})

router.delete(ENDPOINTS.BOOK_ID, async (req, res) => {
    const {id} = req.params

    try {
        const book = await Book.findById(id).select('-__v');
        if (book) {
            await Book.deleteOne({_id: id});
            deleteFile(dirname + '/' + book.fileBook);
            res.json(true);
        }
    } catch (err) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(err);
    }
})

module.exports = router;