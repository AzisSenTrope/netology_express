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
        new Book({
            id: '1',
            title: 'book1',
            description: 'description1',
            authors: 'authors1',
            favorite: 'favorite1',
            fileCover: 'fileCover1',
            fileName: 'fileName1',
            fileBook: 'src/public/files/file1.pdf'
        }),
        new Book({
            id: '2',
            title: 'book2',
            description: 'description2',
            authors: 'authors2',
            favorite: 'favorite2',
            fileCover: 'fileCover2',
            fileName: 'fileName2',
            fileBook: 'src/public/files/file2.pdf'
        }),
    ],
};

module.exports = {
    TEST_RESPONSE,
    Book,
    STORE,
}