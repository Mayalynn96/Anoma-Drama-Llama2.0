const express = require("express");
const app = express();
require("dotenv").config();
const allRoutes = require("./controllers");
const cors = require('cors');

//define sequelize connection in /config/connection
const sequelize = require('./config/connection');

//Set PORT 
const PORT = process.env.PORT || 3001;

//build tables when index.js is run
const {Comment, Llama, Mood, Post, Reaction, User} = require("./models");

//use express methods to interpret JSON objects
//middleware to append the response headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

//references API routes in /controllers for each model
app.use('/api', allRoutes);


//wildcard redirect
app.get("/*", (req, res) => {
    res.send("Oops we couldn't find what you're looking for!");
})

//sync sequelize, dropping and recreating the db each time
//launch server on PORT
sequelize.sync({ force: false }).then(function () {
    app.listen(PORT, function () {
        console.log('App listening on PORT ' + PORT);

    })
});