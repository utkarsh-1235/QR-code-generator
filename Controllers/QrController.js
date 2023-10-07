// const express = require('express');
const QRCode = require('qrcode');
// const fs = require('fs');

// const app = express();
// const port = 3000;

//app.use(express.json());

// Endpoint for generating a QR code and saving it to a file
const generateQr = async (req, res) => {
    const { data, filename } = req.body;

    QRCode.toFile(filename, data, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error generating QR code');
        } else {
            console.log(`QR code saved to ${filename}`);
            res.status(200).send('QR code generated and saved successfully');
        }
    });
};

// Endpoint for reading a QR code and extracting data
app.get('/read/:filename', (req, res) => {
    const filename = req.params.filename;

    QRCode.toDataURL(filename, (err, url) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading QR code');
        } else {
            res.status(200).json({ data: url });
        }
    });
});

module.exports = {generateQr}
