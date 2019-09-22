// The purpose of "use strict" is to indicate that the code should be executed in "strict mode". With strict mode, you can not, for example, use undeclared variables.
'use strict';

require("dotenv").config(); // Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
const func = require("./assets/js/functions"); // Importing the function file
const mysql = require("mysql"); // mysql npm used for connecting to the db
const inquirer = require("inquirer"); // inquirer included used for user prompts
const table = require("cli-table"); // Table display in cli

// // Connecting to the DB
// const db = mysql.createConnection({
//     host: process.env.DB_HOSTNAME,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// db.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected with id " + db.threadId);
//     // Checking Available Production and Start the App
// });
func.checkProducts();