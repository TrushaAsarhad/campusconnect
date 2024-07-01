const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('bodyParser');
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

connectDB();


const app = express();

app.use(cors());

app.use(odyParser.json());


app.use('/api/users',require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/grups'));
app.use('/api/events', require('./routes/events'));
app.use('/api/resources', require('./routes/resources'));



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log('Server is running on port ${PORT}');

});

