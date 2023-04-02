const express = require('express')
const {v4: uuid} = require('uuid')

const TEST_RESPONSE = {id: 1, mail: "test@mail.ru" };

class Book {
    constructor(data) {
        this.id = data?.id || uuid();
        this.title = data?.title || '';
        this.description = data?.description || '';
        this.authors = data?.authors || '';
        this.favorite = data?.favorite || '';
        this.fileCover = data?.fileCover || '';
        this.fileName = data?.fileName || '';
    }
}

const STORE = {
    books: [
        new Book({id: '1'}),
        new Book(),
    ],
};

function runServer(port) {
    const app = express();
    app.use(express.json());

    app.post('/api/user/login', (req, res) => {
        res.json(TEST_RESPONSE);
    })

    app.get('/api/books', (req, res) => {
        const {books} = STORE;
        res.json(books);
    })

    app.get('/api/books/:id', (req, res) => {
        const {books} = STORE;
        const {id} = req.params;
        const idx = books.findIndex(el => el.id === id);

        if( idx !== -1) {
            res.json(books[idx]);
        } else {
            res.status(404);
            res.json('404 | страница не найдена');
        }

    })

    app.post('/api/books', (req, res) => {
        const {books} = STORE;

        console.log('req.body ', req.body);

        const newBook = new Book(req.body);
        books.push(newBook);

        res.status(201);
        res.json(newBook);
    })

    app.put('/api/books/:id', (req, res) => {
        const {books} = STORE;
        const {id} = req.params;
        const idx = books.findIndex(el => el.id === id);

        if (idx !== -1){
            books[idx] = {
                ...books[idx],
                ...req.body,
            }

            res.json(books[idx]);
        } else {
            res.status(404);
            res.json('404 | страница не найдена');
        }
    })

    app.delete('/api/books/:id', (req, res) => {
        const {books} = STORE
        const {id} = req.params
        const idx = books.findIndex(el => el.id === id)

        if(idx !== -1){
            books.splice(idx, 1)
            res.json(true)
        } else {
            res.status(404)
            res.json('404 | страница не найдена')
        }
    })

    app.listen(port)
}

const PORT = process.env.PORT || 3000

runServer(PORT);