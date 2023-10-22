const express = require('express');
const QrRoute = express.Router();


const {generateQr, scanQr, checkAlloted} = require('../Controllers/QrController');

QrRoute.post('/generate', generateQr);
QrRoute.post('check-qr-allotment',checkAlloted);
QrRoute.post('/api/qr/:qrData',scanQr);
module.exports = QrRoute;