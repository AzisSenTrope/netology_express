const express = require('express')
const router = express.Router()
const fileMulter = require('../middleware/file')

const ENDPOINTS = require('../endpoints/endpoints');
const {STORE} = require('../db/db');
const {Book, incrViewsCount, getViewsCount,} = require('../utils/utils');
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
        res.download(dirname +  '/' + book.fileBook, book.fileName);
    } catch (error) {
        res.status(STATUSES.SERVER_ERROR);
        res.json(error);
    }
})

router.get(ENDPOINTS.BOOKS, (req, res) => {
    const {books} = STORE;
    res.render("books/index", {
        title: "Books",
        books: books,
    });
});

router.get(ENDPOINTS.BOOK_ID, async (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        await incrViewsCount(idx);
        books[idx].viewCount = await getViewsCount(idx);
        res.render("books/view", {
            title: "Books | view",
            books: books[idx],
        });
        return;
    }

    res.status(STATUSES.NOT_FOUND);
    res.json('404 | страница не найдена');
    res.redirect('/404');

})

router.get(ENDPOINTS.BOOK_UPDATE, (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx === -1) {
        res.redirect('/404');
    }

    res.render("books/update", {
        title: "BOOKS | view",
        books: books[idx],
    });
});

router.post(ENDPOINTS.BOOK_UPDATE, fileMulter.single('fileBook'), (req, res) => {
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

        if (books[idx].fileBook) {
            books[idx] = {
                ...books[idx],
                ...req.body,
            }
        } else {
            const fileBook = file.path;
            const fileName = file.originalname;
            books[idx] = {
                ...books[idx],
                ...req.body,
                fileName,
                fileBook,
            }
        }

        res.redirect(`../../books/${id}`);
        return;
    }

    res.redirect('/404');
})

router.get(ENDPOINTS.BOOK_CREATE, (req, res) => {
    res.render("books/create", {
        title: "BOOKS | create",
        books: {},
    });
});

router.post(ENDPOINTS.BOOK_CREATE, fileMulter.single('fileBook'), (req, res) => {
    const {books} = STORE;
    const {file} = req

    if (file) {
        const fileBook = file.path
        const fileName = file.originalname;

        const newBook = new Book({...req.body, fileBook, fileName});
        books.push(newBook);

        res.status(STATUSES.CREATED);
        res.redirect(`books/${newBook.id}`);
        return;
    }

    res.status(STATUSES.INVALID);
    res.send({error: 'Invalid data'});
})

router.post(ENDPOINTS.BOOK_DELETE, (req, res) => {
    const {books} = STORE;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);

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
        res.redirect(ENDPOINTS.BOOKS);
        return;
    }

    res.status(STATUSES.NOT_FOUND)
    res.redirect('/404');
})


module.exports = router;