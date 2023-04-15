const {v4: uuid} = require("uuid");
const TEST_RESPONSE = {id: 1, mail: "test@mail.ru" };
const axios = require('axios');

const COUNTER_URL = process.env.COUNTER_URL || "http://localhost:3001";

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
        this.viewCount = 0;
    }
}

async function getViewsCount(id) {
    return await axios
        .get(`${COUNTER_URL}/counter/${id}`)
        .then((result) => {
            return result.data;
        });
}

async function incrViewsCount(id) {
    return axios
        .post(`${COUNTER_URL}/counter/${id}/incr`)
        .then((res) => res.data);
}

module.exports = {
    TEST_RESPONSE,
    Book,
    incrViewsCount,
    getViewsCount,
}