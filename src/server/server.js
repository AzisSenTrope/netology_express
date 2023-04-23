const express = require('express')
const bookRouter = require('../routes/books');
const userRouter = require('../routes/user');
const mainRouter = require('../routes/main');
const ENDPOINTS = require('../endpoints/endpoints');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {dirname} = require('../../config');
const db = require('../db');
const http = require('http');
const socketIO = require('socket.io');

const {options, verify} = require('../utils/utils');

const path = require('path');

function runServer(port) {
    const app = express();
    const server = http.Server(app);
    const io = socketIO(server);
    app.use(express.json());

    app.set('views', path.join(dirname, 'src/views'));
    app.set("view engine", "ejs");


    passport.use('local', new LocalStrategy(options, verify));

    app.use(express.urlencoded());
    app.use(session({ secret: 'SECRET'}));

    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser((user, cb) => {
        cb(null, user.id)
    });

    passport.deserializeUser( (id, cb) => {
        db.users.findById(id,  (err, user) => {
            if (err) { return cb(err) }
            cb(null, user)
        })});

    app.use(ENDPOINTS.API, bookRouter);
    app.use(ENDPOINTS.API, userRouter);
    app.use(mainRouter);

    io.on('connection', (socket) => {
        const {id} = socket;
        console.log(`Socket connected: ${id}`);
        const {idBook} = socket.handshake.query;
        console.log(`Socket book: ${idBook}`);
        socket.join(idBook);

        socket.on('get-messages', () => {
            socket.emit('get-messages', db.chats.getMessagesByBook(idBook));
        })

        socket.on('message-to-room', (msg) => {
            console.log('msg ', msg);
            msg.type = `book: ${idBook}`;
            db.chats.insert({...msg, idBook});
            socket.to(idBook).emit('message-to-room', msg);
            socket.emit('message-to-room', msg);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${id}`);
        });
    });

    server.listen(port);
}

module.exports = runServer;