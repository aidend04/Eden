const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const path = require('path');

app.use(session({
    secret: "ohoiahdoihohohihiiiihohoihioadoi"
}))

let registerRouter = require("./routes/register-router");
let groupRouter = require("./routes/group-router");
let loginRouter = require("./routes/login-router");

mongoose.connect('mongodb://localhost:27017/Eden')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.static('public'));
app.use(express.json());

app.use('/register', registerRouter);
app.use('/group', groupRouter);
app.use('/login', loginRouter);

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'welcome.html'));
});

app.get('/', (req, res) => {
    res.send('testing...');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});