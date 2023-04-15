const express = require("express");
const router = express.Router();

const ENDPOINTS = require('../endpoints/endpoints');

router.get(ENDPOINTS.MAIN, (req, res) => {
    res.render("index", {
        title: "Books",
    });
});

module.exports = router;