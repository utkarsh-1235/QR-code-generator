const express = require('express');
const QrRoute = express.Router();


const {generateQr, scanQr, activateUser, checkQr, getQr, editQr} = require('../Controllers/QrController');

QrRoute.post('/generate', generateQr);
QrRoute.get('/scan/:qrId',scanQr);
QrRoute.post('/activate/:qrId', activateUser);
QrRoute.post('/check-qr-allotment/:qrId', checkQr);
QrRoute.post('/get-qr', getQr);
QrRoute.post('/edit-qr', editQr);

module.exports = QrRoute;