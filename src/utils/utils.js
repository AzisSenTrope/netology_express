const TEST_RESPONSE = {id: 1, mail: "test@mail.ru" };
const BookScheme = require('../model/bookModel');

async function initBooks() {
    try {
        await BookScheme.insertMany([
            {
                title: 'book1',
                description: 'description1',
                authors: 'authors1',
                favorite: 'favorite1',
                fileCover: 'fileCover1',
                fileName: 'fileName1',
                fileBook: 'src/public/files/file1.pdf'
            },
            {
                title: 'book2',
                description: 'description2',
                authors: 'authors2',
                favorite: 'favorite2',
                fileCover: 'fileCover2',
                fileName: 'fileName2',
                fileBook: 'src/public/files/file2.pdf'
            },
        ]);
    } catch (err) {
        console.log(err);
    }

}

module.exports = {
    TEST_RESPONSE,
    initBooks,
}