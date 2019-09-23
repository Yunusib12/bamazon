require("dotenv").config(); // Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
const mysql = require("mysql"); // mysql npm used for connecting to the db
const inquirer = require("inquirer"); // inquirer included used for user prompts
const Table = require("cli-table"); // Table display in cli
let colors = require('colors'); // color text in cli

let db;
let nQty;


// Displaying available Products in the DB
let checkProducts = function() {

    // Connecting to the DB
    db = mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    db.connect(function(err) {
        if (err) throw err;
        console.log("We are Connected with id " + db.threadId);
    });

    let query = "SELECT item_id,product_name,department_name, price, quantity FROM products";

    db.query(query, function(err, res) {
        if (err) throw err;

        //console.log(res);

        let table = new Table({
            head: ["Product ID", "Name", "Department", "Price", "Stock Qty"],
            colWidths: [15, 35, 35, 15, 15]

        });

        res.forEach(elem => {
            table.push([elem.item_id, elem.product_name, elem.department_name, `$ ${elem.price}`, elem.quantity]);
        });
        console.log(table.toString());
        // database = res;
        inquirer.prompt([{
            name: 'whouare',
            type: 'list',
            choices: ['Manager', 'Customer', 'Exit'],
            message: 'Who are You?'
        }]).then(function(choice) {
            switch (choice.whouare) {
                case 'Manager':
                    console.log("Your ar a Manager");
                    break;
                case 'Customer':
                    console.log("You are a Customer");
                    buyProduct();
                    break;
                default:
                    console.log('----- Thank You For Your Visit ----'.green);
                    db.end();
            }
        });
    });

};

// Function that Update product
let updateProductQuantities = function(item, qtyA, qtyND, trans) {

    if (trans === "SELL") {

        nQty = qtyA - qtyND;

    } else {

        nQty = qtyA + qtyND;
    }

    let query = "UPDATE products SET? WHERE?";
    db.query(query, [{
                quantity: nQty
            },
            {
                item_id: parseInt(item)
            }
        ],
        function(err, res) {
            if (err) throw err;
            console.log(`${res.affectedRows} products updated!`);
        });

};
// Function used to buy Products
let buyProduct = function() {

    inquirer.prompt([{
            name: 'productID',
            type: 'input',
            message: 'Please choose a product you would like to buy?',
            validate: function(value) {

                var valid = !isNaN(parseFloat(value));
                return valid || "Only Numbers are allowed";
            }
        },
        {
            name: 'quantity',
            type: 'input',
            message: 'How many units would you like to buy?',
            validate: function(value) {

                var valid = !isNaN(parseFloat(value));
                return valid || "Only Numbers are allowed";
            }
        }
    ]).then(function(answer) {
        let qtyND = parseInt(answer.quantity, 10);
        let productID = answer.productID;

        let queryQtyAvailable = "SELECT quantity FROM products WHERE?";
        db.query(queryQtyAvailable, { item_id: productID }, function(err, res) {
            if (err) throw err;

            let qPA = res[0].quantity;
            if (qPA < qtyND) {
                console.log("There is not enough stock for the amount you choose. Please select another Item or Reduce the Amount.".red);
                buyProduct();
            } else {
                console.log("We got this");
                updateProductQuantities(productID, qPA, qtyND, "SELL");

            }
        })

        // console.log(qty);
        // console.log(productID);
        // console.log(database[answer.productID - 1].quantity);
    })

};








module.exports = {
    checkProducts: checkProducts,
    buyProduct: buyProduct
}