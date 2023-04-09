const {v4: uuid} = require("uuid");
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
        this.fileBook = data?.fileBook || '';
    }
}

const STORE = {
    books: [
        new Book({id: '1', fileBook: 'src/public/files/demo.png'}),
        new Book({id: '2', fileBook: 'src/public/files/file.txt'}),
    ],
};

module.exports = {
    TEST_RESPONSE,
    Book,
    STORE,
}