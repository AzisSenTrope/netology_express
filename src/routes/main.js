const express = require("express");
const router = express.Router();

const ENDPOINTS = require('../endpoints/endpoints');

router.get(ENDPOINTS.MAIN, (req, res) => {
    res.render("index", {
        title: "Books",
        isAuthenticated: req.isAuthenticated(),
    });
});

module.exports = router;