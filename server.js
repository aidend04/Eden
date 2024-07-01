const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
app.use(cookieParser());
const port = 3000;

const path = require('path');

const edenStore = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
});

app.use(session({
    name: 'session_token',
    secret: process.env.SESSION_SECRET,
    cookie: {maxAge: 1000 * 60 * 30},
    store: edenStore,
    resave: false,
    saveUninitialized: false
}))

let registerRouter = require("./routes/register-router");
let loginRouter = require("./routes/login-router");
let logoutRouter = require("./routes/logout-router");
let groupRouter = require("./routes/group-router");
let homeRouter = require("./routes/home-router");
let expenseRouter = require("./routes/expense-router");

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.static('public'));
app.use(express.json());

app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

app.use((req, res, next) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        next();
    }
});

app.get('/', (req, res) => {
    res.send('testing...');
});

app.use('/home', homeRouter);
app.use('/expense', expenseRouter);

app.use((req, res, next) => {

    console.log(req.session.groupId);
    if (req.session.groupId) {
        res.redirect('/home');
    } else {
        next();
    }
});
app.use('/group', groupRouter);

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'welcome.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});