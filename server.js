const express = require('express')
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const packagesRoutes = require('./routes/Packages');
const commentRoutes = require('./routes/comments');
const ratingRoutes = require("./routes/ratings");
const bookingRoutes = require('./routes/booking');

const paymentRoutes = require('./routes/payment');
const contentRoutes = require('./routes/content');
const quotesRoutes = require('./routes/quotes')
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const topPackagesRoutes = require('./routes/topPackages');

require('dotenv').config();




const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/apiAuth',authRoutes);
app.use('/apiPackages',packagesRoutes);
app.use('/apiComment',commentRoutes);
app.use('/apiRating',ratingRoutes);
app.use('/apiBooking',bookingRoutes);
app.use('/apiPayment',paymentRoutes);

app.use('/tours', topPackagesRoutes);
app.use('/home', contentRoutes);
app.use('/home',quotesRoutes);



mongoose
.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("MongoDB Connected Successfully!!!");
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Error occured: " ,err.message);
});