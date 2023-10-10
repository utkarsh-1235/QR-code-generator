const express = require('express');
const app = new express();
 const userAuthRoute = require('./Routers/userRoute');
 const cookieParser = require('cookie-parser');
 const bodyParser = require('body-parser');
 const cors = require('cors');
 const morgan = require('morgan');
const QrRoute = require('./Routers/QrRoute');
 const errorMiddleware = require('./Middleware/errorMiddleware');
// const paymentRoute = require('./Route/paymentRoute');


app.use(express.json()); // Built-in middleware

// Parse JSON requests
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true })); //Third-party middleware

app.use(cookieParser());   // Third-party middleware

 app.use(morgan('dev'));


 //auth route
 app.use('/api/v1/users',userAuthRoute);

 //qr Route
 app.use('/api/v1/qr',QrRoute);



app.all('*',(req, res)=>{
    res.status(400).json('OOPS 404 not found')
})

app.use(errorMiddleware);

module.exports = app;