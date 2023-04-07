const multer = require('multer')
const {parse} = require("uuid");

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, 'src/public/files');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

module.exports = multer({storage})
