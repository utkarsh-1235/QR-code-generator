const express = require('express');
const QrRoute = express.Router();


const {generateQr} = require('../Controllers/QrController');

QrRoute.get('/generate',generateQr);
module.exports = QrRoute;