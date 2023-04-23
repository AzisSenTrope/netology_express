const fs = require('fs');


function deleteFile(path) {
    fs.unlinkSync(path);
}

module.exports = deleteFile;