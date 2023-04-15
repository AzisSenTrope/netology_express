const {Book} = require('../utils/utils');

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
    STORE,
}