const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');


const { userRoute } = require('./routes/api/users');
const { profileRouter } = require('./routes/api/profile');
const { postsRouter } = require('./routes/api/posts');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB Config
const db = require('./config/keys').mongoUri;
//Connect to MongoDB using mongoose
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use(passport.initialize());
//Passport Config
require('./config/passport')(passport);

//Use Routes
app.use('/api/users', userRoute);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter)

const port = process.env.PORT | 5000;

app.listen(port, () => console.log(`Server running on ${port}`));