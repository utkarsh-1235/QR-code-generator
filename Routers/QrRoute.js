const express = require('express');
const QrRoute = express.Router();


const {generateQr, scanQr} = require('../Controllers/QrController');

QrRoute.post('/generate',generateQr);
QrRoute.post('/api/qr/:qrData',scanQr);
module.exports = QrRoute;