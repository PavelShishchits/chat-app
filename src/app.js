const express = require('express');
const http = require('http');
const { join } = require('path');
const app = express();
const rootFolder = join(__dirname, '../');

const server = http.createServer(app);
app.use(express.static(join(rootFolder, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

module.exports = server;