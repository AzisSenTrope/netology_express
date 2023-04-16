const {Schema, model} = require('mongoose')

const BookScheme = new Schema({
    id: String,
    title: String,
    description: String,
    authors: String,
    favorite: String,
    fileCover: String,
    fileName: String,
    fileBook: String,
}, {
    versionKey: false,
    id: true,
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id
            delete ret._id
        }
    }
});

module.exports = model('BookModel', BookScheme);