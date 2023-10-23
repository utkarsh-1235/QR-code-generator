const express = require('express');
const QrRoute = express.Router();


const {generateQr, scanQr} = require('../Controllers/QrController');

QrRoute.post('/generate', generateQr);
QrRoute.get('/scan/:qrId',scanQr);
module.exports = QrRoute;