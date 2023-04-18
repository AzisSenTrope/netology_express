const express = require("express");
const router = express.Router();

const passport = require('passport')

const ENDPOINTS = require('../endpoints/endpoints');

const db = require('../db');

router.get(ENDPOINTS.LOGIN,   (req, res) => {
    res.render('user/login', {
        title: "Books",
        isAuthenticated: req.isAuthenticated(),
    })
});

router.post(ENDPOINTS.LOGIN,
    passport.authenticate('local', {failureRedirect: 'login'}),
    (req, res) => {
        res.redirect('me');
});

router.get(ENDPOINTS.SING_UP,   (req, res) => {
    res.render('user/register', {
        error: '',
        isAuthenticated: req.isAuthenticated(),
        title: "Books",
    })
});

router.post(ENDPOINTS.SING_UP,
    (req, res, next) => {
        const isBusy = db.users.isUsernameBusy(req.body.username);
        if (isBusy) {
            res.render('user/register', {
                error: 'Имя занято, выберете другое',
                isAuthenticated: req.isAuthenticated(),
                title: "Books",
            })
            return;
        }
        db.users.insert(req.body)
        next();
    }, passport.authenticate('local', {failureRedirect: 'login'}), (req, res, next) => {
        res.redirect('../../../../api/user/me');
    })

router.get(ENDPOINTS.LOGOUT,  (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.log('err ', err);
        }
    });
    res.redirect('/')
})

router.get(ENDPOINTS.PROFILE,
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('api/user/login')
        }
        next()
    },
    (req, res) => {
        req.isAuthenticated()
        res.render('user/profile', {
            title: 'Books',
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    }
)

module.exports = router;