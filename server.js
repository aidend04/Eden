const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

let registerRouter = require("./routes/register-router");

mongoose.connect('mongodb://localhost:27017/Eden')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.use(express.static('public'));
app.use(express.json());
app.use('/register', registerRouter);

app.get('/', (req, res) => {
    res.send('testing...');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});