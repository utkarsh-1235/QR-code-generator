const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require('dotenv').config()

const MONGODB_URL = process.env.MONGODB_URL||'mongodb://localhost:27017/Learning-Management'
const dbConnect = ()=>{
    mongoose
         .connect(MONGODB_URL)
         .then((conn)=>{console.log(`database connected successfully ${conn.connection.host}`)})
         .catch((err)=>{console.log("ERROR", err.message)})

        }
        
module.exports = dbConnect;