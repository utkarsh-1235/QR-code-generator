const express = require('express');
const app = new express();
 const userAuthRoute = require('./Routers/userRoute');
 const cookieParser = require('cookie-parser');
 const bodyParser = require('body-parser');
 const cors = require('cors');
 const path = require('path');
 const morgan = require('morgan');
const QrRoute = require('./Routers/QrRoute');
 const errorMiddleware = require('./Middleware/errorMiddleware');
 const AppError = require('./Utils/error.util');
const QRModel = require('./Models/QRModel');

// const paymentRoute = require('./Route/paymentRoute');


app.use(express.json()); // Built-in middleware

// Parse JSON requests
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: [process.env.CLIENT_URL], credentials: true })); //Third-party middleware

app.use(cookieParser());   // Third-party middleware

 app.use(morgan('dev'));

 app.use((req, res, next) => {
    console.log('Request Payload:', req.body);
    next();
  });

  app.use((err, req, res, next) => {
    // Handle errors and send an appropriate response
    console.error(err); // Log the error
    res.status(500).json({ error: 'Internal Server Error' });
  });

 //auth route
 app.use('/api/v1/users',userAuthRoute);

   //qr Route
 app.use('/api/v1/qr',QrRoute);

const static_path = path.join(__dirname, '../client');
app.use(express.static(static_path));
// console.log(path.join(__dirname));
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(static_path, 'dashboard.html'));
});

app.get('/signupdetails', (req, res) => {
  res.sendFile(path.join(static_path, 'signupdetails.html'));
});
app.all('*',(req, res)=>{
    res.status(400).json('OOPS 404 not found')
})

app.use(errorMiddleware);

module.exports = app;