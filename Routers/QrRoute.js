const express = require('express');
const QrRoute = express.Router();


const {generateQr, scanQr, activateUser, checkQr} = require('../Controllers/QrController');

QrRoute.post('/generate', generateQr);
QrRoute.get('/scan/:qrId',scanQr);
QrRoute.post('/activate/:qrId', activateUser);
QrRoute.get('/check-qr-allotment', checkQr);
module.exports = QrRoute;